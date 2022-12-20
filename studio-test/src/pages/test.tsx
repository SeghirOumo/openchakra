import React, { useState, useEffect } from 'react'
import Metadata from '../dependencies/Metadata'
import axios from 'axios'

import {
  Flex,
  Text,
  Button,
  IconButton,
  Avatar,
  Input,
  Select,
  Radio
} from 'native-base'

import Media from '../dependencies/custom-components/Media'

import UploadFile from '../dependencies/custom-components/UploadFile'

// import RadioGroup from '../dependencies/custom-components/RadioGroup'

// import { ChevronLeftIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'

import Fonts from '../dependencies/theme/Fonts'
// import { useLocation } from 'react-router-dom'
// import { useUserContext } from '../dependencies/context/user'
// import withDynamicButton from '../dependencies/hoc/withDynamicButton'

const DynamicButton = Button
const DynamicIconButton = IconButton

const EditInfo = () => {
  // const query = new URLSearchParams(useLocation().search)
  //const id = query.get('user')
//   const { user } = useUserContext()
  const get = axios.get
  const [root, setRoot] = useState([])

  const [refresh, setRefresh] = useState(false)

  const reload = () => {
    setRefresh(!refresh)
  }

//   useEffect(() => {
//     get(`/myAlfred/api/studio/user/${id ? `${id}/` : ``}`)
//       .then(res => setRoot(res.data))
//       .catch(err => alert(err?.response?.data || err))
//   }, [get, id, refresh])

  return (
    <>
      <Fonts />
      <Metadata metaTitle={''} metaDescription={''} metaImageUrl={''} />
      <Flex
        id="comp-LBUM2VNK2WIQ5"
        reload={reload}
        flexDirection={{ base: 'column' }}
        maxHeight={{ base: '100vh' }}
        height={{ base: '100vh' }}
        m={{ base: '0' }}
        p={{ base: '0' }}
        flexGrow={1}
        backgroundColor="#F5F6FA"
      >
        <Flex
          id="comp-LBUM2VNKXYE6F"
          reload={reload}
          width={{ base: '100%' }}
          minWidth={{ base: '100%' }}
          maxHeight={{ base: '5%' }}
          justifyContent={{ base: 'flex-start' }}
          alignItems={{ base: 'center' }}
          pl={{ base: '3' }}
          pr={{ base: '3' }}
          pt={{ base: '2' }}
          pb={{ base: '1' }}
          minHeight={{ base: '10vh' }}
          m={{ base: '0' }}
          flexGrow={1}
          mt={{ base: '-1' }}
          position="fixed"
          right="0px"
          left="0px"
          top="0px"
          zIndex={2}
          backgroundSize="cover"
          borderRadius={{ base: '0px 0px 20px 20px ' }}
          backgroundColor="#FDFEFE"
          boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
        >
          <Flex
            id="comp-LBUM2VNK6CRXU"
            reload={reload}
            flexGrow={1}
            justifyContent={{ base: 'flex-start' }}
            alignItems={{ base: 'center' }}
          >
            <DynamicIconButton
              id="comp-LBUM2VNKTJPYK"
              reload={reload}
              context={root?.[0]?._id}
              backend="/"
              dataModel="user"
              aria-label="icon"
              size="md"
              mr={{ base: '3' }}
              dataSourceId="root"
              dataSource={root}
              action="openPage"
              actionProps='{"page":"profil","open":"false"}'
              pageName={'profil'}
              onClick={() => (window.location = '/profil')}
            />
            <Text
              id="comp-LBUM2VNKE6GVL"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'lg' }}
            >
              Mes informations
            </Text>
          </Flex>
        </Flex>
        <Flex
          id="comp-LBUM2VNK1SBHH"
          reload={reload}
          alignItems={{ base: 'center' }}
          flexDirection={{ base: 'column' }}
          justifyContent={{ base: 'flex-start' }}
          overflow={{ base: 'scroll' }}
          pb={{ base: '20%', sm: '20%' }}
          backgroundSize="contain"
          pt={{ base: '20%', sm: '5%' }}
          p={{ sm: '', md: '' }}
          backgroundColor="#F5F6FA"
        >
          <Flex
            id="comp-LBUM2VNKVRR5N"
            reload={reload}
            FlexGrow={1}
            width={{ base: '100%' }}
            flexDirection={{ base: 'column' }}
            p={{ base: '0' }}
          />
          <Flex
            id="comp-LBUM3MV63N4H2"
            reload={reload}
            flexDirection={{ base: 'column' }}
            justifyContent={{ base: 'center' }}
            alignItems={{ base: 'center' }}
            mt={{ base: '4' }}
          >
            <Avatar
              id="comp-LBUM4HLEX233L"
              reload={reload}
              size="xl"
              showBorder
              name="S"
              src="https://www.alfredplace.io/wp-content/uploads/2022/12/profil-18.svg"
              border={{ base: '1px solid #6CCACE' }}
            />
            <Flex
              id="comp-LBW11W7RJGZ36"
              reload={reload}
              justifyContent={{ base: 'center' }}
              alignItems={{ base: 'center' }}
              p={{ base: '0' }}
              mt={{ base: '-6' }}
            >
              <UploadFile id="comp-LBUM71X2W0L9G" reload={reload}>
                <IconButton
                  id="comp-LBUM71X2AMVQV"
                  reload={reload}
                  aria-label="icon"
                  size="md"
                  borderRadius={{ base: '17px' }}
                  backgroundColor="#3FABB0"
                  color="#ffffff"
                  pl={{ base: '4' }}
                  pr={{ base: '4' }}
                />
              </UploadFile>
            </Flex>
            <Text
              id="comp-LBUM8UUVVWDFR"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: '14' }}
            >
              Modifier ma photo de profil
            </Text>
          </Flex>
          <Flex
            id="comp-LBUM2VNKXE5GF"
            reload={reload}
            mt={{ base: '10' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUM2VNKUCVF3"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Prénom
            </Text>
            <Input
              id="comp-LBUMBRCR3HFPE"
              reload={reload}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              border={{ base: '0px' }}
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              placeholder="Prénom"
              fontFamily="futura"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMR37J4150Q"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMR37JHSKW8"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Nom
            </Text>
            <Input
              id="comp-LBUMR37NZ4POE"
              reload={reload}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              border={{ base: '0px' }}
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              placeholder="Nom"
              fontFamily="futura"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMS01FS8MB3"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMS01FLOMUE"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Email
            </Text>
            <Input
              id="comp-LBUMS01FIL8FT"
              reload={reload}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              border={{ base: '0px' }}
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              placeholder="E-mail"
              fontFamily="futura"
              type="email"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMXNPAKDPM1"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMXNPAKFRYE"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Numéro de téléphone
            </Text>
            <Input
              id="comp-LBUMXNPA4S98F"
              reload={reload}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              border={{ base: '0px' }}
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              placeholder="Téléphone"
              fontFamily="futura"
              type="tel"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMXNE9VMAR7"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMXNE941LRQ"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Date de naissance
            </Text>
            <Input
              id="comp-LBUMXNEAMQE1X"
              reload={reload}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              border={{ base: '0px' }}
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              placeholder="jj/mm/aaaa"
              fontFamily="futura"
              type="date"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMXL6NYGQJ0"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMXL6ORH4AB"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Sexe biologique
            </Text>
            <Select
              id="comp-LBUMYUXZOXWII"
              reload={reload}
              
              variant="outline"
              size="md"
              boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
              borderRadius={{ base: '10px' }}
              backgroundColor="#ffffff"
              fontFamily="futura"
              focusBorderColor="#43ABB1"
            />
          </Flex>
          <Flex
            id="comp-LBUMXLW1S57KL"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUMXLW199H01"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Taille
            </Text>
            <Flex
              id="comp-LBUN0PB5PBF11"
              reload={reload}
              justifyContent={{ base: 'flex-start' }}
              alignItems={{ base: 'center' }}
            >
              <Input
                id="comp-LBUMXLW12W7R2"
                reload={reload}
                borderRadius={{ base: '10px' }}
                backgroundColor="#ffffff"
                border={{ base: '0px' }}
                boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
                placeholder="Taille en cm"
                fontFamily="futura"
                type="number"
                width={{ base: '60%' }}
                focusBorderColor="#43ABB1"
              />
              <Text
                id="comp-LBUN0S28Z7ZGU"
                reload={reload}
                fontFamily="futura"
                ml={{ base: '3' }}
                color="#172D4D"
                fontWeight={{ base: 'bold' }}
                fontSize={{ base: 'md' }}
              >
                cm
              </Text>
            </Flex>
          </Flex>
          <Flex
            id="comp-LBUN1OOA2U3XM"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUN1OOAOYFC7"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Poids
            </Text>
            <Flex
              id="comp-LBUN1OOARNME0"
              reload={reload}
              justifyContent={{ base: 'flex-start' }}
              alignItems={{ base: 'center' }}
            >
              <Input
                id="comp-LBUN1OOAD6F6B"
                reload={reload}
                borderRadius={{ base: '10px' }}
                backgroundColor="#ffffff"
                border={{ base: '0px' }}
                boxShadow={{ base: '15px 10px 10px #E6E6E6' }}
                placeholder="Poids en kg"
                fontFamily="futura"
                type="number"
                width={{ base: '60%' }}
                focusBorderColor="#43ABB1"
              />
              <Text
                id="comp-LBUN1OOA7NBZZ"
                reload={reload}
                fontFamily="futura"
                ml={{ base: '3' }}
                color="#172D4D"
                fontWeight={{ base: 'bold' }}
                fontSize={{ base: 'md' }}
              >
                kg
              </Text>
            </Flex>
          </Flex>
          <Flex
            id="comp-LBUN4P8MRRAFI"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUN4P8MFVORK"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Traitement contre l'hypertension ?{' '}
            </Text>
            <Flex
              id="comp-LBUN4P8M2IPGI"
              reload={reload}
              justifyContent={{ base: 'flex-start' }}
              alignItems={{ base: 'flex-start' }}
              flexDirection={{ base: 'column' }}
            >
              <Radio.Group
                id="comp-LBUN5GY69L6US"
                reload={reload}
                fontFamily="futura"
              >
                <Flex
                  id="comp-LBUOKYA8XD5PX"
                  reload={reload}
                  flexDirection={{ base: 'column' }}
                  mt={{ base: '2' }}
                >
                  <Radio
                    id="comp-LBUOL7BQ1MHY6"
                    reload={reload}
                    size="lg"
                    colorScheme="blackAlpha"
                  >
                    Oui
                  </Radio>
                  <Radio
                    id="comp-LBUOLERSJTAXO"
                    reload={reload}
                    size="lg"
                    colorScheme="blackAlpha"
                    mt={{ base: '2' }}
                  >
                    Non
                  </Radio>
                </Flex>
              </Radio.Group>
            </Flex>
          </Flex>
          <Flex
            id="comp-LBUN7XVPFX6WR"
            reload={reload}
            mt={{ base: '2' }}
            width={{ base: '85%' }}
            mb={{ base: '4' }}
            flexDirection={{ base: 'column' }}
          >
            <Text
              id="comp-LBUN7XVP84V56"
              reload={reload}
              fontFamily="futura"
              color="#172D4D"
              fontWeight={{ base: 'bold' }}
              fontSize={{ base: 'md' }}
            >
              Consommation de tabac ?
            </Text>
            <Flex
              id="comp-LBUN7XVQPLBHW"
              reload={reload}
              justifyContent={{ base: 'flex-start' }}
              alignItems={{ base: 'flex-start' }}
              flexDirection={{ base: 'column' }}
            >
              <Radio.Group
                id="comp-LBUONQG7JY0QI"
                reload={reload}
                fontFamily="futura"
              >
                <Flex
                  id="comp-LBUONQG7WMCX3"
                  reload={reload}
                  flexDirection={{ base: 'column' }}
                  mt={{ base: '2' }}
                >
                  <Radio
                    id="comp-LBUONQG7NZRLQ"
                    reload={reload}
                    size="lg"
                    colorScheme="blackAlpha"
                  >
                    Je fume
                  </Radio>
                  <Radio
                    id="comp-LBUONQG7P7HCA"
                    reload={reload}
                    size="lg"
                    colorScheme="blackAlpha"
                    mt={{ base: '2' }}
                  >
                    J'ai arrêté de fumer
                  </Radio>
                  <Radio
                    id="comp-LBUOOEWS80I44"
                    reload={reload}
                    size="lg"
                    colorScheme="blackAlpha"
                    mt={{ base: '2' }}
                  >
                    Je n'ai jamais fumé
                  </Radio>
                </Flex>
              </Radio.Group>
            </Flex>
          </Flex>
          <Flex
            id="comp-LBUM2VNKOAIV6"
            reload={reload}
            flexDirection={{ base: 'column' }}
            flexgrow={1}
            justifyContent={{ base: 'flex-end' }}
            alignItems={{ base: 'center' }}
          >
            <Flex
              id="comp-LBUM2VNKO986Y"
              reload={reload}
              justifyContent={{ base: 'space-between' }}
              alignItems={{ base: 'space-between' }}
              mt={{ base: '10' }}
              pt={{ base: '8' }}
              borderTop="1px solid grey"
            >
              <DynamicButton
                id="comp-LBUM2VNKXEKFQ"
                reload={reload}
                context={root?.[0]?._id}
                backend="/"
                dataModel="user"
                variant="solid"
                size="lg"
                borderRadius={{ base: '20px' }}
                border={{ base: '2px solid #F69248' }}
                fontFamily={{ base: 'futura' }}
                color="#F69248"
                colorScheme="whiteAlpha"
                mr={{ base: '2' }}
                width={{ base: '50%' }}
                dataSourceId="root"
                dataSource={root}
                action="openPage"
                actionProps='{"page":"profil","open":"false"}'
                pageName={'profil'}
                onClick={() => (window.location = '/profil')}
              >
                Annuler
              </DynamicButton>
              <DynamicButton
                id="comp-LBUM2VNK2I0V1"
                reload={reload}
                context={root?.[0]?._id}
                backend="/"
                dataModel="user"
                variant="solid"
                size="lg"
                borderRadius={{ base: '20px' }}
                fontFamily={{ base: 'futura' }}
                color="#FFF"
                colorScheme="whiteAlpha"
                backgroundColor="#6CCACE"
                ml={{ base: '2' }}
                width={{ base: '50%' }}
                dataSourceId="root"
                dataSource={root}
                action="openPage"
                actionProps='{"page":"profil","open":"false"}'
                pageName={'profil'}
                onClick={() => (window.location = '/profil')}
              >
                Enregistrer
              </DynamicButton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}

export default EditInfo
