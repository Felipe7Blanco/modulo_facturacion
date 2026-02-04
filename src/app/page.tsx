'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Spinner, Text } from '@chakra-ui/react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de facturas
    router.push('/invoices')
  }, [router])

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg="gray.50"
      gap={4}
    >
      <Spinner size="xl" color="brand.500" />
      <Text color="gray.600" fontSize="lg">
        Cargando sistema de facturación...
      </Text>
    </Box>
  )
}