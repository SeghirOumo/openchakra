import React from 'react'
import lodash from 'lodash'
import {
  Box,
  Button,
  Image,
  List,
  ListItem,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import {
  getPages,
  getRootPageId,
  getActivePageId,
} from '~core/selectors/components'
import useDispatch from '~hooks/useDispatch'

import PageSettings from './PageSettings'

const PageActions = ({ page }: { page: string }) => {
  const dispatch = useDispatch()

  const { onOpen, isOpen, onClose } = useDisclosure()

  const deleteP = async elem => {
    await new Promise(() => dispatch.project.deletePage(elem)).then(a =>
      console.log(a),
    )
  }

  const duplicatePage = () => {
    dispatch.project
      .duplicatePage(page)
      .then(() => console.log('ok'))
      .catch(err => console.error(err))
  }

  const buttonProps = {
    p: 0,
    w: '30px',
    h: '30px',
    minWidth: 'auto',
    minHeight: 'auto',
  }

  return (
    <>
      <Button {...buttonProps} onClick={onOpen}>
        <Image w={'30px'} title="Edit" src="/icons/edit.svg" />
      </Button>
      {isOpen && <PageSettings isOpen={isOpen} onClose={onClose} page={page} key={page}/>}

      <Button {...buttonProps} onClick={() => deleteP(page)}>
        <Image w={'30px'} title="Edit" src="/icons/delete.svg" />
      </Button>
      {false && <Button {...buttonProps} onClick={() => console.log('Nothing yet')}>
        <Image w={'30px'} title="Save" src="/icons/save.svg" />
      </Button>
      }
      <Button {...buttonProps} onClick={duplicatePage}>
        <Image w={'30px'} title="Save" src="/icons/duplicate.svg" />
      </Button>
    </>
  )
}

const PageList = ({ searchTerm }: { searchTerm: string }) => {
  const pages = useSelector(getPages)
  const activePage = useSelector(getActivePageId)
  const rootPage = useSelector(getRootPageId)
  const dispatch = useDispatch()

  const sortedPages=lodash(pages).values().orderBy(params => lodash.kebabCase(params.pageName)).value()

  return (
    <List mb={8}>
      {sortedPages
        .filter(params =>
          params.pageName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((params, i) => {
          const { pageId, pageName } = params
          const isIndexPage = pageId === rootPage
          const isSelectedPage = pageId === activePage

          return (
            <ListItem
              key={i}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems="center"
              color="black"
              paddingBlock={2}
              borderBottom={'1px solid black'}
            >
              <Button
                p={0}
                bg={'transparent'}
                color="black"
                whiteSpace={'normal'}
                wordBreak={'break-all'}
                overflow={'hidden'}
                textAlign={'left'}
                onClick={() => dispatch.project.setActivePage(pageId)}
                fontWeight={isSelectedPage ? 'bold' : 'normal'}
              >
                {pageName}
                {isIndexPage && '*'}
              </Button>
              <Box display={'flex'} alignItems="center">
                <PageActions page={pageId} />
              </Box>
            </ListItem>
          )
        })}
    </List>
  )
}

export default PageList
