import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      render(<Input value="Initial value" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('Initial value')
    })

    it('should render with default value', () => {
      render(<Input defaultValue="Default value" />)
      expect(screen.getByRole('textbox')).toHaveValue('Default value')
    })
  })

  describe('Types', () => {
    it('should render as text input by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Input without explicit type defaults to text (may not have type attribute)
      expect(input.tagName).toBe('INPUT')
    })

    it('should render as email input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render as password input', () => {
      render(<Input type="password" />)
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should render as number input', () => {
      render(<Input type="number" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Behavior', () => {
    it('should call onChange when value changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<Input onChange={handleChange} />)

      await user.type(screen.getByRole('textbox'), 'test')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledTimes(4) // Once for each character
    })

    it('should update value on user input', async () => {
      const user = userEvent.setup()

      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should have disabled cursor class when disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      // Check for the disabled:cursor-not-allowed class in the full className
      expect(input.className).toContain('disabled:cursor-not-allowed')
    })

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly value="Readonly" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readOnly')
    })
  })

  describe('Validation', () => {
    it('should support required attribute', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10')
    })

    it('should support minLength attribute', () => {
      render(<Input minLength={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '5')
    })

    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[0-9]*')
    })
  })

  describe('Custom classes', () => {
    it('should merge custom className with default classes', () => {
      render(<Input className="custom-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
      expect(input).toHaveClass('h-10') // Default height class
    })

    it('should have correct height class', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveClass('h-10')
    })

    it('should have correct padding class', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveClass('px-3')
    })
  })

  describe('HTML attributes', () => {
    it('should support name attribute', () => {
      render(<Input name="username" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username')
    })

    it('should support id attribute', () => {
      render(<Input id="email-input" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email-input')
    })

    it('should support aria-label attribute', () => {
      render(<Input aria-label="Search" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Search')
    })

    it('should support data-testid attribute', () => {
      render(<Input data-testid="my-input" />)
      expect(screen.getByTestId('my-input')).toBeInTheDocument()
    })

    it('should support autoComplete attribute', () => {
      render(<Input autoComplete="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      input.focus()

      expect(input).toHaveFocus()

      await user.keyboard('test')
      expect(input).toHaveValue('test')
    })

    it('should support tabIndex', () => {
      render(<Input tabIndex={-1} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('tabIndex', '-1')
    })

    it('should have focus-visible styles', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveClass('focus-visible:outline-none')
      expect(screen.getByRole('textbox')).toHaveClass('focus-visible:ring-1')
    })
  })

  describe('Number input specific', () => {
    it('should support step attribute for number inputs', () => {
      render(<Input type="number" step="0.01" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toHaveAttribute('step', '0.01')
    })

    it('should support min attribute for number inputs', () => {
      render(<Input type="number" min="0" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toHaveAttribute('min', '0')
    })

    it('should support max attribute for number inputs', () => {
      render(<Input type="number" max="100" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toHaveAttribute('max', '100')
    })
  })

  describe('Focus management', () => {
    it('should accept focus', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(input).toHaveFocus()
    })

    it('should lose focus on blur', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()

      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalled()
    })

    it('should call onFocus when focused', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()

      render(<Input onFocus={handleFocus} />)

      await user.click(screen.getByRole('textbox'))

      expect(handleFocus).toHaveBeenCalled()
    })
  })
})
