"""
Configuração customizada de rate limiting com suporte a IPs confiáveis
"""
from fastapi import Request
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.trusted_ip import TrustedIP


async def get_remote_address_with_whitelist(request: Request) -> str:
    """
    Obtém o endereço IP do cliente e retorna um identificador especial
    se o IP estiver na whitelist de IPs confiáveis.

    Se o IP estiver na whitelist, retorna "trusted_ip" que não será limitado.
    Caso contrário, retorna o endereço IP normal para aplicar rate limiting.
    """
    # Tenta obter o IP real através de headers de proxy
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"

    # Verificar se o IP está na whitelist
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(TrustedIP).where(
                    TrustedIP.ip_address == client_ip,
                    TrustedIP.is_active == True
                )
            )
            trusted_ip = result.scalar_one_or_none()

            if trusted_ip:
                # IP confiável - retorna identificador especial que não será limitado
                return f"trusted_ip_{client_ip}"
    except Exception as e:
        # Em caso de erro na consulta, continua com o IP normal
        pass

    # IP não confiável - retorna IP normal para rate limiting
    return client_ip
