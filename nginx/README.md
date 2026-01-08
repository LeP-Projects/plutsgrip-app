# Nginx Configuration

## Visão Geral

Este diretório contém a configuração do Nginx para o ambiente de produção do PlutusGrip. O Nginx atua como reverse proxy, gerenciando o roteamento entre o frontend e a API backend.

## Arquivos

- `nginx.conf` - Configuração principal do Nginx para produção
- `certs/` - Diretório para certificados SSL/TLS (gitignored)

## Funcionalidades

### Segurança

- **Rate Limiting**: Limitação de requisições por IP
  - Endpoints gerais: 10 req/s
  - Endpoints de API: 30 req/s
  - Endpoints de autenticação: 5 req/s (mais restrito)
- **Connection Limiting**: Máximo de 10 conexões simultâneas por IP
- **Headers de Segurança**:
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: no-referrer-when-downgrade
  - Permissions-Policy: bloqueia geolocalização, microfone, câmera
- **Bloqueio de Paths Sensíveis**: /admin, /wp-admin, /.git, /.env, etc.

### Performance

- **Gzip Compression**: Nível 6 para todos os tipos de conteúdo relevantes
- **Keepalive Connections**: Reutilização de conexões HTTP
- **Static Assets Caching**: Cache de 1 ano para arquivos estáticos
- **Buffering**: Configurado para otimizar throughput

### Roteamento

- `/api/*` → Backend API (api:8000)
- `/docs`, `/openapi.json`, `/redoc` → Documentação da API
- `/health` → Health check
- `/*` → Frontend (frontend:3000)

## Uso

### Desenvolvimento

O Nginx **NÃO** é usado em desenvolvimento. Os serviços são acessados diretamente:

```bash
# Iniciar apenas serviços de desenvolvimento (sem Nginx)
docker compose --profile dev --env-file .env.dev up -d

# Acessar serviços diretamente
- Frontend: http://localhost:5173 (Vite dev server)
- API: http://localhost:8000 (FastAPI com hot reload)
- pgAdmin: http://localhost:5050
```

### Produção

O Nginx é automaticamente incluído via profile `prod`:

```bash
# Iniciar ambiente de produção (inclui Nginx)
docker compose --profile prod --env-file .env.prod up -d

# Acessar aplicação através do Nginx
- Aplicação: http://localhost (ou seu domínio)
- API: http://localhost/api
- Docs: http://localhost/docs
- Health: http://localhost/health
```

## Configuração SSL/TLS

### Certificados Self-Signed (Testes)

Para gerar certificados self-signed para testes locais:

```bash
# Criar diretório de certificados
mkdir -p nginx/certs

# Gerar certificado self-signed
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"
```

### Let's Encrypt (Produção)

Para produção, use Let's Encrypt ou outro provedor de certificados:

#### Opção 1: Certbot Standalone

```bash
# Instalar certbot
sudo apt-get install certbot

# Obter certificados (temporariamente pare o Nginx)
docker compose stop nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/certs/
sudo chmod 644 nginx/certs/*

# Reiniciar Nginx
docker compose start nginx
```

#### Opção 2: Certbot com Nginx

```bash
# Obter certificados com Nginx rodando
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Ativar HTTPS

Após obter os certificados:

1. Edite `nginx/nginx.conf`
2. Descomente a seção **HTTP to HTTPS REDIRECT**
3. Descomente a seção **HTTPS SERVER**
4. Atualize `server_name` com seu domínio real
5. Reinicie o Nginx:

```bash
docker compose restart nginx
```

## Monitoramento

### Visualizar Logs

```bash
# Logs em tempo real
docker compose logs -f nginx

# Apenas logs de acesso
docker compose exec nginx tail -f /var/log/nginx/access.log

# Apenas logs de erro
docker compose exec nginx tail -f /var/log/nginx/error.log

# Logs com grep (ex: apenas erros 5xx)
docker compose logs nginx | grep " 5[0-9][0-9] "
```

### Métricas nos Logs

O formato de log inclui métricas de tempo:

- `rt`: Request time total
- `uct`: Upstream connect time
- `uht`: Upstream header time
- `urt`: Upstream response time

```bash
# Analisar requisições lentas (> 1s)
docker compose exec nginx tail -100 /var/log/nginx/access.log | grep -E 'rt=[1-9][0-9]*\.'
```

## Troubleshooting

### Testar Configuração

```bash
# Validar sintaxe do nginx.conf
docker compose exec nginx nginx -t

# Saída esperada:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Recarregar Configuração

```bash
# Recarregar sem downtime
docker compose exec nginx nginx -s reload

# Ou reiniciar container (breve downtime)
docker compose restart nginx
```

### Verificar Upstreams

```bash
# Testar conectividade com API
docker compose exec nginx wget -qO- http://api:8000/health

# Testar conectividade com Frontend
docker compose exec nginx wget -qO- http://frontend:3000

# Verificar DNS interno
docker compose exec nginx nslookup api
docker compose exec nginx nslookup frontend
```

### Rate Limiting

```bash
# Testar rate limiting (deve bloquear após X requisições)
ab -n 100 -c 10 http://localhost/api/health

# Verificar logs de rate limiting
docker compose logs nginx | grep "limiting requests"
```

### Problemas Comuns

#### 1. Erro 502 Bad Gateway

**Causa**: Backend não está respondendo

**Solução**:
```bash
# Verificar se API está rodando
docker compose ps api

# Verificar logs da API
docker compose logs api

# Testar API diretamente
docker compose exec api curl http://localhost:8000/health
```

#### 2. Erro 504 Gateway Timeout

**Causa**: Request demorou mais que o timeout configurado

**Solução**:
- Aumentar `proxy_read_timeout` em nginx.conf
- Otimizar queries lentas na API
- Verificar logs para identificar endpoint lento

#### 3. Certificados SSL Inválidos

**Causa**: Certificados expirados ou inválidos

**Solução**:
```bash
# Verificar validade do certificado
openssl x509 -in nginx/certs/fullchain.pem -noout -dates

# Renovar certificados Let's Encrypt
sudo certbot renew
sudo cp /etc/letsencrypt/live/yourdomain.com/* nginx/certs/
docker compose restart nginx
```

#### 4. Rate Limiting Muito Agressivo

**Causa**: Configuração muito restritiva

**Solução**:
- Editar `limit_req_zone` em nginx.conf
- Aumentar rate (ex: `rate=50r/s`)
- Aumentar burst (ex: `burst=100`)
- Whitelist IPs confiáveis (adicionar lógica personalizada)

## Otimizações Avançadas

### Cache de Proxy

Para cache mais agressivo (adicione ao nginx.conf):

```nginx
# Definir zona de cache
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

# Usar cache nas location blocks
location /api/some-cacheable-endpoint {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    # ... resto da config
}
```

### WebSocket Support

Se precisar suportar WebSocket:

```nginx
location /ws {
    proxy_pass http://api_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400; # 24 horas
}
```

### Load Balancing

Para múltiplas instâncias da API:

```nginx
upstream api_backend {
    least_conn;  # ou ip_hash
    server api1:8000 max_fails=3 fail_timeout=10s;
    server api2:8000 max_fails=3 fail_timeout=10s;
    server api3:8000 max_fails=3 fail_timeout=10s;
    keepalive 32;
}
```

## Referências

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
