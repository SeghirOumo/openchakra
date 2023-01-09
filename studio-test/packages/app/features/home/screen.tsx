import { Anchor, Button, H1, Input, Text, Paragraph, Separator, Sheet, XStack, YStack } from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import React, { useState } from 'react'
import {TextLink, useLink } from 'solito/link'
import { Box, Flex } from 'app/components/Chakra'
import * as DocumentPicker from 'expo-document-picker'

export function HomeScreen() {
  const linkProps = useLink({
    href: '/user/nate',
  })
  
  const linkToConnexion = useLink({
    href: '/connexion',
  })


  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    alert(result.uri);
    console.log(result);
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <YStack space="$4" maxWidth={600}>
        <H1 bg={'red'} ta="center">Welcome to Wapp'easy.</H1>
        <Paragraph ta="center">
          Here's a basic starter to show navigating from one screen to another. This screen uses the
          same code on Next.js and React Native.
        </Paragraph>

        <Separator />
        <Box 
          flexDirection="column" 
          $gtSm={{
            backgroundColor: 'blue',
          }}
          $gtMd={{
            backgroundColor: 'green',
          }}
          >
          <Paragraph>Coucou, c'est nous</Paragraph>
          <Text
            mt={2} 
            fontWeight="semibold" 
          >
          Modern, Chic Penthouse with Mountain, City & Sea Views
        </Text>
        <Button onPress={_pickDocument}>push this</Button>
        </Box>
        <Flex bg="red">
        <Paragraph>Coucou, c'est nous</Paragraph>
        </Flex>

        <TextLink color='white' {...linkToConnexion}> Ahahah, pour le 15 janvier </TextLink>
        <Button color='white' {...linkToConnexion}> Ahahah, pour le 15 janvier </Button>

        <Paragraph ta="center">
          Made by{' '}
          <Anchor color="$color12" href="https://twitter.com/natebirdman" target="_blank">
            @natebirdman
          </Anchor>
          ,{' '}
          <Anchor
            color="$color12"
            href="https://github.com/tamagui/tamagui"
            target="_blank"
            rel="noreferrer"
          >
            give it a ⭐️
          </Anchor>
        </Paragraph>
      </YStack>

      <XStack>
        <Button {...linkProps}>Link to user</Button>
      </XStack>

      <SheetDemo />
    </YStack>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)
  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
