import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Configuración personalizada del tema
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Colores primarios del proyecto (tw-primary)
        brand: {
          50: { value: "#e6f0ff" },
          100: { value: "#b3d4ff" },
          200: { value: "#80b8ff" },
          300: { value: "#4d9cff" },
          400: { value: "#1a80ff" },
          500: { value: "#0066e6" }, // Color principal
          600: { value: "#0052b3" },
          700: { value: "#003d80" },
          800: { value: "#00294d" },
          900: { value: "#00141a" },
        },
        // Colores de estado para facturas
        invoice: {
          draft: { value: "#718096" },      // Gris
          pending: { value: "#F59E0B" },    // Amarillo/Naranja
          sent: { value: "#10B981" },       // Verde
          paid: { value: "#059669" },       // Verde oscuro
          rejected: { value: "#EF4444" },   // Rojo
          overdue: { value: "#DC2626" },    // Rojo oscuro
        }
      },
    },
    semanticTokens: {
      colors: {
        // Background principal (tw-primary)
        "bg-primary": {
          value: { base: "{colors.brand.500}", _dark: "{colors.brand.700}" }
        },
        "bg-secondary": {
          value: { base: "#F7FAFC", _dark: "#1A202C" }
        },
        // Textos
        "text-primary": {
          value: { base: "#1A202C", _dark: "#F7FAFC" }
        },
        "text-inverse": {
          value: "#FFFFFF"
        },
        // Bordes
        "border-subtle": {
          value: { base: "#E2E8F0", _dark: "#2D3748" }
        }
      }
    }
  },
})

// Crear el sistema con la configuración personalizada
export const system = createSystem(defaultConfig, config)