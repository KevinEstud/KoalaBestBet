import { ChatIcon, SmallCloseIcon, EmailIcon } from "@chakra-ui/icons";
// chakra imports
import useTchat  from "hooks/useTchat"
import useAuth  from "hooks/useAuth"
import useAxiosPrivate from "hooks/useAxiosPrivate";
import {
  Container,
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Text
} from "@chakra-ui/react";
import { Send } from 'react-feather';
import React, {useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
 function Tchat() {
   let fontCol = 'white'
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showtchat, setShowTchat] = useState(false)
  const [actualroom, setActualRoom] = useState('french');
  const [errormodal, setErrorModal] = useState(false)
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef()
  const { socket, allmessages, setAllMessages } = useTchat();
  const [usermodal, setUserModal] = useState({
    username: "",
    KoalaCoins: "",
    avatar_path: "",
    Grade: "",
    memberSince: ""
  });
  const [message, setMessage] = useState('')
  const [inputdisabled, setInputDisabled] = useState(false)
  async function openModal (username, event) {
    await axiosPrivate.post('/infos/user/details/username', { username })
    .then((e) => {
      if(e?.status === 201) {
        setUserModal({
          username: e?.data.username,
          avatar_path: e?.data.avatar_path,
          KoalaCoins: e?.data.koalacoin,
          Grade: e?.data.grade,
          memberSince: e?.data.memberSince
        });
      }
      else {
        setErrorModal(e?.data.error)
      }
    }).catch((e) => {
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    }).finally(() => onOpen(event))
  }
  function publishMessages(msg, i){
    let date = new Date(msg?.createdAt).toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'})
        return (
          <li>
          <Container key={i} bg="linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 76.65%)" borderRadius={'8px'} border="solid 0px" p="1.4em" m="2" fontStyle={'italic'} display={'-webkit-box'} wordBreak='break-word'>
          <Image borderRadius='full' boxSize='24px' src={require(`images/avatar/${msg.avatar_path}`)} alt='Profile Picture' />
          <Text as="span" color={fontCol} fontSize="14px">&ensp;{date}&ensp;</Text> 
          <Link onClick={(e) => openModal(msg.username, e)} color={msg.color} fontSize="14px">{msg.username}:&ensp;</Link>
          <Text as="span" color={fontCol} fontSize="14px">{msg.message}</Text>
          </Container>
          </li>
          );
}
  const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    if(message !== '' && message?.length < 255 && !inputdisabled) {
        setInputDisabled(true)
        socket.emit("chat_message", {
        username: auth?.username,
        avatar_path: auth?.avatar_path,
        color: auth?.color, 
        room: actualroom??'french',
        message,
        createdAt: new Date()
      });
      setTimeout(() => {
        setInputDisabled(false)
      }, 1500)
     return setMessage('')
    } else {
      let oldmessage = message;
      setMessage('Maximum 255 Caractères ! ')
     return setTimeout(() => {
        setMessage(oldmessage)
      }, 2500)
    }
  }
  useEffect(() => {
    let isMounted = true
    if(isMounted && actualroom && socket) {
      let lastRoom ;
      if(actualroom === "french") {
        lastRoom = "english"
      } else if (actualroom === "english") {
        lastRoom = "french"
      }
      socket.emit("leave_room", lastRoom)
      socket.emit("enter_room", actualroom);
      socket.on("init_messages", msg => {
        setAllMessages([]);
        if(msg.messages){
         msg.messages.forEach((el) => {
           setAllMessages(prev => [...prev, el]);
          })
          }}
       );
      socket.on("received_message", (msg) => {
      setAllMessages(allmessages => [...allmessages, msg]);
      })
    }
    return () => {
      if(socket) {
        socket.off();
      }
      isMounted = false ;
    }

  }, [actualroom, setActualRoom, setAllMessages])
  useEffect(() => {
    let isMounted = true
    if(isMounted) scrollToBottom();
    isMounted = false
  },[allmessages, publishMessages])

    return ( 
        <Flex justifyContent={'flex-end'}>
        {!showtchat ?
        <Flex  style={{ zIndex:1, transition: 'linear .3s'}}  top="30%" borderRadius='5px' position={'fixed'} bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 1.65%)'
        height={'45vh'} width={'1.4em'} flexDirection={'column'} justifyContent={'center'}>
        <IconButton boxSize={'24px'} style={{ zIndex:2, transition: 'linear .1s'}} onClick={() =>  setShowTchat(prev => !prev)} icon={<ChatIcon />} transform={'scale(2)'} paddingRight='2em' paddingLeft={'.8em'} />
        </Flex> :
        <>
        <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
        <ModalOverlay />
        <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'}>
          <ModalHeader color="whiteAlpha.800" alignSelf={'center'}>Infos du joueur</ModalHeader>
          <ModalCloseButton />
          <ModalBody color="whiteAlpha.800">
            {!errormodal && usermodal?.avatar_path ?
            <Flex flexDir={'column'} alignItems='center'> 
            <Image borderRadius='full' boxSize='6em' src={require(`images/avatar/${usermodal?.avatar_path}`)} alt='Profile Picture' />
              <Text>
                {usermodal.username} 
              </Text>
              <Text>
              KoalaCoins : {usermodal.KoalaCoins}
            </Text>
            <Text>
           Grade : {usermodal.Grade}
          </Text>
          <Text>
          Membre depuis :
          </Text>
          <Text>
          {usermodal.memberSince} 
          </Text>
          </Flex>
              : 
              <>
              <Text>{errormodal}</Text>
              </>
            }
          </ModalBody>

          <ModalFooter alignSelf={'center'}>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
        
        <Flex  style={{ zIndex:1, transition: 'linear .3s'}} top="30%" borderRadius='5px' position={'fixed'} bg='rgba(10, 31, 77, 0.9)'
        height={'65%'} width={'40vh'} flexDirection={'column'}>
        <IconButton boxSize={'18px'}  onClick={() => setShowTchat(prev => !prev)} icon={<SmallCloseIcon />} transform={'scale(1.8)'} paddingRight='.4em' paddingLeft={'.4em'} />
          {actualroom &&
          <Text alignSelf={'center'} color={fontCol} fontSize="14px">{actualroom.charAt(0).toUpperCase() + actualroom.slice(1)} Tchat</Text>
          }
          <Flex flexDirection={'row'} justifyContent={'flex-end'}>
        <Image onClick={() => setActualRoom('french')} style={{cursor: 'pointer'}} borderRadius='full' margin='3%' boxSize={actualroom === 'french' ? '34px' : '28px'} src={require(`assets/img/flag/fr.png`)} alt='Flag Tchat FR' />
        <Image onClick={() => setActualRoom('english')} style={{cursor: 'pointer'}} borderRadius='full' margin='3%' boxSize={actualroom === 'english' ? '34px' : '28px'} src={require(`assets/img/flag/en.png`)} alt='Flag Tchat EN' />
        </Flex>
        <Box overflowY={'scroll'} overflowX={'hidden'} paddingRight={'.7em'} width={'100%'}>
          <ul>
          {allmessages && allmessages.length > 0 &&
          allmessages?.map((e, i) => { return publishMessages(e, i) } )
          }
          </ul>
          <div ref={messagesEndRef} />
        </Box>
        <form onSubmit={onSubmit}>
        <InputGroup p={'auto'} paddingBottom=".4em" m={'auto'} width={'95%'} size="md">
        <Input isDisabled={inputdisabled} onChange={(e) => setMessage(e?.target.value)} value={message} color="white"  bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 76.65%)' />
        <InputRightElement>
        <Send boxSize={'24px'}/>
        </InputRightElement>
        </InputGroup>
        </form>
        </Flex> 
        </>
        }
      </Flex>
    );
}
export default Tchat;