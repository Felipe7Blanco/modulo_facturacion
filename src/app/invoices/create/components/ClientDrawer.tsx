'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    Input,
    Stack,
    Heading,
    Flex,
    Text,
} from '@chakra-ui/react'
import { X } from 'lucide-react'

interface ClientDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSelectClient: (client: any) => void
}

export function ClientDrawer({ isOpen, onClose, onSelectClient }: ClientDrawerProps) {
    const [formData, setFormData] = useState({
        personType: 'juridica',
        idType: 'NIT',
        nit: '',
        businessName: '',
        tradeName: '',
        economicActivity: '',
        ivaResponsibility: '',
        fiscalResponsibilities: '',
        email: '',
        phone: '',
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        const newClient = {
            _id: `client-${Date.now()}`,
            name: formData.businessName || 'Nuevo Cliente',
            email: formData.email,
            nit: formData.nit,
            phone: formData.phone,
        }

        onSelectClient(newClient)
        onClose()
    }

    const handleCancel = () => {
        setFormData({
            personType: 'juridica',
            idType: 'NIT',
            nit: '',
            businessName: '',
            tradeName: '',
            economicActivity: '',
            ivaResponsibility: '',
            fiscalResponsibilities: '',
            email: '',
            phone: '',
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="blackAlpha.600" zIndex={1000} onClick={onClose} />

            {/* Drawer */}
            <Box position="fixed" top={0} right={0} bottom={0} w={{ base: '100%', md: '500px' }} bg="white" boxShadow="2xl" zIndex={1001} overflowY="auto" animation="slideIn 0.3s ease-out">
                <style jsx>{`
                  @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                  }
                `}</style>

                {/* Header */}
                <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
                    <Heading size="md" color="gray.800">Crear Cliente</Heading>
                    <Button size="sm" variant="ghost" onClick={onClose} colorScheme="gray"><X size={20} /></Button>
                </Flex>

                {/* Form Content */}
                <Box p={6}>
                    <Stack gap={4}>
                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Tipo de Persona *</Text>
                            <Flex gap={3}>
                                <Button flex={1} variant={formData.personType === 'juridica' ? 'solid' : 'outline'} colorScheme={formData.personType === 'juridica' ? 'blue' : 'gray'} onClick={() => handleChange('personType', 'juridica')}>Jurídica</Button>
                                <Button flex={1} variant={formData.personType === 'natural' ? 'solid' : 'outline'} colorScheme={formData.personType === 'natural' ? 'blue' : 'gray'} onClick={() => handleChange('personType', 'natural')}>Natural</Button>
                            </Flex>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Tipo de Identificación *</Text>
                            <select value={formData.idType} onChange={(e) => handleChange('idType', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white' }}>
                                <option value="NIT">NIT</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                                <option value="TI">Tarjeta de Identidad</option>
                            </select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Número {formData.idType} *</Text>
                            <Flex gap={2}>
                                <Input placeholder="Ej: 900123456-7" value={formData.nit} onChange={(e) => handleChange('nit', e.target.value)} flex={1} />
                                <Button colorScheme="blue" variant="outline" onClick={() => console.log('Consultar DIAN')}>Consultar DIAN</Button>
                            </Flex>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">{formData.personType === 'juridica' ? 'Nombre Empresa' : 'Nombre Completo'} *</Text>
                            <Input placeholder={formData.personType === 'juridica' ? 'Ej: Empresa S.A.S.' : 'Ej: Juan Pérez'} value={formData.businessName} onChange={(e) => handleChange('businessName', e.target.value)} />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Nombre Comercial</Text>
                            <Input placeholder="Nombre comercial o marca" value={formData.tradeName} onChange={(e) => handleChange('tradeName', e.target.value)} />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Actividad Económica Principal</Text>
                            <Input placeholder="Código CIIU" value={formData.economicActivity} onChange={(e) => handleChange('economicActivity', e.target.value)} />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Responsabilidad IVA *</Text>
                            <select value={formData.ivaResponsibility} onChange={(e) => handleChange('ivaResponsibility', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white' }}>
                                <option value="">Seleccione</option>
                                <option value="responsable">Responsable de IVA</option>
                                <option value="no-responsable">No Responsable de IVA</option>
                                <option value="regimen-simple">Régimen Simple de Tributación</option>
                            </select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Responsabilidades Fiscales</Text>
                            <select value={formData.fiscalResponsibilities} onChange={(e) => handleChange('fiscalResponsibilities', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white' }}>
                                <option value="">Seleccione</option>
                                <option value="gran-contribuyente">Gran Contribuyente</option>
                                <option value="autorretenedor">Autorretenedor</option>
                                <option value="agente-retencion-iva">Agente de Retención IVA</option>
                                <option value="regimen-simple">Régimen Simple</option>
                            </select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Correo Electrónico *</Text>
                            <Input type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">Teléfono *</Text>
                            <Input type="tel" placeholder="300 123 4567" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                        </Box>
                    </Stack>

                    {/* Botones de acción */}
                    <Flex gap={3} mt={8}>
                        <Button flex={1} variant="outline" colorScheme="gray" onClick={handleCancel}>Cancelar</Button>
                        <Button flex={1} variant="outline" colorScheme="blue" onClick={handleSave}>Guardar Cliente</Button>
                    </Flex>
                </Box>
            </Box>
        </>
    )
}