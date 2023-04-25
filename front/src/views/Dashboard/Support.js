/*!

=========================================================
* Vision UI Free Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, {useEffect, useState, useRef} from "react";
import ReCAPTCHA from "react-google-recaptcha";
// Chakra imports
import { Alert, AlertIcon, Button, Flex, FormControl,Text, Textarea, Input, Modal, FormLabel, Container, Image, IconButton,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    InputGroup,
    InputRightElement,
    ModalCloseButton, useDisclosure, Select, SimpleGrid, Box, Icon  } from "@chakra-ui/react";
    import { Send } from 'react-feather';
    import { FaTimesCircle, FaTrashAlt, FaPaperPlane } from "react-icons/fa";
    import { SearchIcon } from "@chakra-ui/icons";
    import ReactPaginate from "react-paginate";
import { useNavigate, useLocation } from "react-router-dom";
import galaxy from "assets/img/galaxy.jpg";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import useTchat from "hooks/useTchat";
import useAuth from "hooks/useAuth";
const lastItem = 'no';
function Support() {
  let fontCol = "gray.500"
    const [groupInfos, setGroupInfos] = useState({
    subject: "",
    text: ""
    })
    const { auth} = useAuth()
    const recaptchaRef = useRef(null)
    const messagesEndRef = useRef()
    const { isOpen: isEditOpen , onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
    const { isOpen: isDeleteOpen , onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isTicketOpen , onOpen: onTicketInfos, onClose: onTicketClose } = useDisclosure()
    const { isOpen: isCloseOpen , onOpen: onCloseOpen, onClose: onCloseClose } = useDisclosure()
    const { socket } = useTchat();
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState()
    const [ticketsfiltered, setTicketsFiltered] = useState([]);
    const [sucessticket, setSuccessTicket] = useState(false)
    const [errorticket, setErrorTicket] = useState(false)
    const [ticketmodal, setTicketModal] = useState(false)
    const [searchvalue, setSearchValue] = useState(""); 
    const [loadingmodal, setLoadingModal] = useState(false)
    const [inputdisabled, setInputDisabled] = useState(false)
    const [gotloaded, setGotLoaded] = useState(false)
    const [error, setError]= useState();
    const [selectticket, setSelectedTicket] = useState()
    const [success, setSuccess] = useState('');
    const [pageNumber, setPageNumber] = useState(0);
    const [tickets, setTickets] = useState([])
    const axiosPrivate = useAxiosPrivate();
    const [valuefiltered, setValueFiltered] = useState(false??true);
    const location  = useLocation();
    const navigate = useNavigate();
    const usersPerPage = 5;
    const pageCount  = (element) => Math.ceil(element / usersPerPage);
    const pagesVisited = pageNumber * usersPerPage;
    const changePage = ({ selected }) => {
      setPageNumber(selected);
    };
    function getFilter (value) {
      const filtered = tickets.filter((el) => {
        if(value == ""  && !valuefiltered || value.length <= 1 && !valuefiltered) {
          return el;
        } else if(value == ""  && valuefiltered || value.length <= 1 && valuefiltered) {
          return el;
        }
        else if (el.ticket_code.toLowerCase().includes(value.toLowerCase()) && value.length >= 2){
          return el ;
        }
      }); 
      if(value == ""  && !valuefiltered || value.length <= 1 && !valuefiltered) {
        setValueFiltered(false)
      }
      if(value == ""  && valuefiltered || value.length <= 1 && valuefiltered) {
        setPageNumber(0);
        setValueFiltered(false)
      }
      if (value !== "" || value.length >= 2){
        setPageNumber(0);
        setTicketsFiltered(filtered)
        setValueFiltered(true)
      }
    }
    const onSubmit = async (e) => {
      e.preventDefault();
      const controller = new AbortController();
      if(message !== '' && message?.length < 255 && message?.length > 3 && selectticket) {
        await axiosPrivate.put(`/send-message/${selectticket}`,{data: { text: message } } ,{signal: controller.signal}).then((e) => {
          if(e?.status === 201) {
                setSuccessTicket(e?.data?.success)
                setTicketModal([...ticketmodal, e?.data?.tickets_infos])
                setErrorTicket(false)
                setMessage('')
                messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
                return setTimeout(() => {
                  setInputDisabled(false)
                }, 1500)
              } else {
                setErrorTicket(e?.data?.error??'Un Problème est survenu.')
              }
          })
       return setMessage('')
      } else {
        let oldmessage = message;
        setMessage('De 3 à 255 Caractères autorisé. ')
       return setTimeout(() => {
          setMessage(oldmessage)
        }, 2500)
      }
    }
    const onChange = (e) => {
      setGroupInfos({...groupInfos, [e.target.name]:e.target.value})
      }
    const deleteTicket = async (value, event) => {
      await axiosPrivate.delete(`/delete-ticket/${value}`).then((res) => {
        if(res?.status === 201) {
            const ticketFiltered = tickets.filter(x => x.ticket_code !== value);
            setTickets(ticketFiltered)
        } else {
          setError(res?.data?.error)
        }
      })
      onDeleteClose(event)
    }
    function getTicketMessages (e, i) {
      let date = new Date(e?.updated_at??e?.created_at).toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'})
      return(
        <li>
          <Box overflowX={'hidden'} paddingRight={'.7em'} width={'100%'}>
          <Container key={i} bg="linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 76.65%)" borderRadius={'8px'} border="solid 0px" p="1.4em" m="2" fontStyle={'italic'} display={'-webkit-box'} wordBreak='break-word'>
          <Image borderRadius='full' boxSize='24px' src={e?.avatar_path ? require(`images/avatar/${e.avatar_path}`) : require(`images/avatar/${auth?.avatar_path}`)} alt='Profile Picture' /><Text>{e?.username??auth?.username}</Text>
          <Text as="span" color={fontCol} fontSize="14px">&ensp;{date}&ensp;</Text> 
          <Text as="span" color={fontCol} fontSize="14px">{e?.text}</Text>
          </Container>
          </Box>
        </li>
      )
    }
    const createTicket = async (e) =>{
        e.preventDefault();
        const controller = new AbortController();
       if (groupInfos.text.length > 10 && groupInfos.text?.length < 256 && groupInfos.subject?.length > 2 && groupInfos.subject.length < 17) {
            const captchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            await axiosPrivate.put('/create-ticket', { data:{ subject: groupInfos.subject, text: groupInfos.text, recaptcha :captchaToken} }, {signal: controller.signal}).then((res) => {
                if(res?.status === 201) {
                    setGroupInfos({
                      subject: "",
                      text: ""
                    })
                    setTickets([...tickets, res?.data?.tickets_infos])
                    setSuccessTicket(res?.data?.success)
                } else {
                  setErrorTicket(res?.data?.error)
                }
            })
         } else if(groupInfos.subject.length < 3) {
            setErrorTicket('Veuillez écrire saisir un sujet de minimum 3 caractères.');
         } else if (groupInfos.subject.length > 17) {
          setErrorTicket('Veuillez écrire saisir un sujet de maximum 16 caractères.');
         }
         else {
          setSuccessTicket(false);
            setErrorTicket('Veuillez écrire un message de minimum 10 caractères et maximum 255 caractères.');
         }
    }
    useEffect(async () => {
        document.title = "KoalaBestBet - Support"
        const controller = new AbortController();
        let isMounted = true
        if(isMounted) {
          setLoading(true)
          await axiosPrivate.get('/list-tickets', {signal: controller.signal}).then((res) => {
              if(res?.status === 201) {
                  setTickets(res.data)
                  setLoading(false)
              } else {
                  setLoading(false)
                  setError(res?.data?.error)
              }
          }).catch((e) => {
            console.error(e)
            if(socket) {
              socket.disconnect()
            }
            return navigate('/auth/signin', { state: { from: location }, replace: true });
          })
        }
        return () => {
          isMounted = false
          controller.abort()
        }
    }, [])
    async function openModal (ticket_code, event) {
      const controller = new AbortController();
      let isMounted = true 
      if(isMounted) {
        await axiosPrivate.get(`/list-messages/${ticket_code}`, { signal: controller.signal })
        .then((e) => {
          if(e?.status === 201) {
            setTicketModal(e?.data)
            setError(false)
          }
          else {
            setError(e?.data.error)
          }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        }).finally(() =>  {
          onTicketInfos(event)
          messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        })
      }
      return () => {
        isMounted = false
        controller.abort()
      }
      
    }
  return (
    <Flex direction='column' mx='auto'>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Support
          </Text>
        </CardHeader>
      </Card>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />Cette page est destinée a toute les requêtes, que ce soit pour un soucis constaté concernant le site web, ou tout autre chose, vous recevrez une réponse par mail.</Alert>
                  </Card>
                  {error &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
        {success &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{success}</Alert>
                  </Card>
        }
        
      <Card marginTop=".2em" marginBottom=".2em">
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} m='.2em'>
        <Button onClick={onEditOpen}>Créer un ticket</Button>
          <Modal
            isCentered
            isOpen={isEditOpen} onClose={() => {onEditClose()}}
            motionPreset='slideInBottom'
            size="3xl"
          >
            <ModalOverlay />
            <ModalContent marginRight=".5em" marginLeft=".5em" alignItems='center' bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)'>
              <ModalHeader color='whiteAlpha.800' isCentered>Envoyer mon ticket</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
              {errorticket && 
                <Card overflowX={{ sm: "scroll", xl: "hidden" }} m="auto" maxWidth="350px" p=".8em">
                <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{errorticket}</Alert>
                </Card>
              }
              {sucessticket && 
                <Card overflowX={{ sm: "scroll", xl: "hidden" }} m="auto" maxWidth="350px" p=".8em">
                <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{sucessticket}</Alert>
                </Card>
              }
              {loadingmodal ?
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
              :
              <form onSubmit={createTicket} className="ModalJoin">
            <FormControl>
              <FormLabel color="gray.500" m="1em">Sujet</FormLabel>
              <Input width={'300px'} color="whiteAlpha.800" name="subject" value={groupInfos?.subject} onChange={onChange} placeholder="Sujet... (ex: Bug, Suggestions...)"
              />
            </FormControl>
            <FormControl variant="outlined">
            <FormLabel color="gray.500" m="1em">Message</FormLabel>
              <Textarea width={'300px'} color="whiteAlpha.800" name="text" value={groupInfos?.text} onChange={onChange} placeholder="Votre message..."
              />
            </FormControl>
              <ModalFooter justifyContent={'center'}>
                <Button color="black" bg="red.500" mr={3} onClick={() => {onEditClose()}}>
                  Fermer
                </Button>
                <Button color="black" bg="green.500" type="submit" variant='solid'>Envoyer</Button>
              </ModalFooter>
                <FormControl display='flex' alignItems='center'>
              <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
              size="invisible"
              />
              </FormControl>
            </form>  
            }
              </ModalBody>
            </ModalContent>
          </Modal>
      </Card>
    <Flex flexDirection='column'>
    <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
    <Flex flexDirection='row' justifyContent={'center'}>
    <InputGroup style={{margin: 'auto', color: 'gray.500' }} borderRadius='15px' w='250px'>
      <InputRightElement
        children={
          <IconButton
          bg='inherit'
          borderRadius='inherit'
            _hover='none'
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
            icon={
              <SearchIcon color={'gray.500'} w='15px' h='15px' />
            }></IconButton>
        }
        />
        <Input
        fontSize='xs'
        py='11px'
        value={searchvalue}
        onChange={(e) => {getFilter(e.target.value), setSearchValue(e.target.value)}}
        color='gray.500'
        placeholder="Saisissez l'ID du ticket : #2993.."
          borderRadius='inherit'
          />
        </InputGroup>
        </Flex>
        </Card>
    {loading ?
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
              : tickets && tickets.length > 0 && searchvalue.length === 0 ? tickets.slice(pagesVisited, pagesVisited + usersPerPage).map((e, i, arr) => {
       return (
        <Card p='16px' bgImage={galaxy} m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
        <SimpleGrid minChildWidth='120px' spacing={'40px'}>
        <Box
        p='24px'
        bgPosition="0 -21em"
        my='22px'
        alignItems={'center'}
        borderRadius='20px'>
        <SimpleGrid minChildWidth='120px' spacing={'40px'} alignItems={'center'}>
        <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} backdropFilter='blur(42px)' borderRadius="1em" p='1em' alignItems='center'>
        <Text color='gray.400' fontSize='s'>
        <Text as='span' color='white'>
        Ticket ID : #{e?.ticket_code} 
        <br /> Status : {e?.status === 'in progress'?<Text as='span' color='orange.500'>En attente</Text>:e?.status === 'answered'?<Text as='span' color='green.500'>Répondu</Text>:<Text as='span' color='red.500'>Fermé</Text>}
        <br /> Sujet : {e?.subject}
        </Text>
        </Text>
        </Card>
      <Button
variant='no-hover'
mb={{ sm: "10px", md: "0px" }}
me={{ md: "12px" }} color='green.500'
size='lg'
onClick={(event) => { openModal(e?.ticket_code, event); setSelectedTicket(e?.ticket_code);} } cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" justifyContent={'center'} backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
  <Icon as={FaPaperPlane} me='4px' w='16px' h='16px' />
  <Text fontSize='xs' color='gray.400'>Répondre</Text>
</Button>
<Button
variant='no-hover'
mb={{ sm: "10px", md: "0px" }}
me={{ md: "12px" }} color='red.500'
size='lg'
bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={(ev) => {onDeleteOpen(ev); setSelectedTicket(e?.ticket_code)} }
justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
  <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
  <Text fontSize='xs' color='gray.400'>Supprimer le ticket</Text>
</Button>
</SimpleGrid>
</Box>
</SimpleGrid>
</Card>
       )
        }) : ticketsfiltered && ticketsfiltered.length > 0 && valuefiltered && ticketsfiltered.slice(pagesVisited, pagesVisited + usersPerPage).map((e, i, arr) => {
          return (
           <Card p='16px' bgImage={galaxy} m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
           <SimpleGrid minChildWidth='120px' spacing={'40px'}>
           <Box
           p='24px'
           bgPosition="0 -21em"
           my='22px'
           alignItems={'center'}
           borderRadius='20px'>
           <SimpleGrid minChildWidth='120px' spacing={'40px'} alignItems={'center'}>
           <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} backdropFilter='blur(42px)' borderRadius="1em" p='1em' alignItems='center'>
           <Text color='gray.400' fontSize='s'>
           <Text as='span' color='white'>
           Ticket ID : #{e?.ticket_code} 
           <br /> Status : {e?.status === 'in progress'?<Text as='span' color='orange.500'>En attente</Text>:e?.status === 'answered'?<Text as='span' color='green.500'>Répondu</Text>:<Text as='span' color='red.500'>Fermé</Text>}
           <br /> Sujet : {e?.subject}
           </Text>
           </Text>
           </Card>
         <Button
   variant='no-hover'
   mb={{ sm: "10px", md: "0px" }}
   me={{ md: "12px" }} color='green.500'
   size='lg'
   onClick={(event) => { openModal(e?.ticket_code, event); setSelectedTicket(e?.ticket_code);} } cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" justifyContent={'center'} backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
     <Icon as={FaPaperPlane} me='4px' w='16px' h='16px' />
     <Text fontSize='xs' color='gray.400'>Répondre</Text>
   </Button>
   <Button
   variant='no-hover'
   mb={{ sm: "10px", md: "0px" }}
   me={{ md: "12px" }} color='red.500'
   size='lg'
   bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 100%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={(ev) => { onCloseOpen(ev); setSelectedTicket(e?.ticket_code)  } }
   justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
     <Icon as={FaTimesCircle} me='4px' w='16px' h='16px' />
     <Text fontSize='xs' color='gray.400'>Clore le ticket</Text>
   </Button>
   <Button
   variant='no-hover'
   mb={{ sm: "10px", md: "0px" }}
   me={{ md: "12px" }} color='red.500'
   size='lg'
   bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={(ev) => {onDeleteOpen(ev); setSelectedTicket(e?.ticket_code)} }
   justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
     <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
     <Text fontSize='xs' color='gray.400'>Supprimer le ticket</Text>
   </Button>
   </SimpleGrid>
   </Box>
   </SimpleGrid>
   </Card> )})}
        {ticketsfiltered.length > usersPerPage && valuefiltered ?
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(ticketsfiltered.length)}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        /> : 
        tickets.length > usersPerPage && !valuefiltered &&
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(tickets.length)}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
          }
        <Modal
isCentered
isOpen={isDeleteOpen} onClose={onDeleteClose}
motionPreset='slideInBottom'>
<ModalOverlay />
<ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
  <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Êtes-vous sur de vouloir supprimer le ticket?</center></ModalHeader>
  <ModalCloseButton />
  <ModalBody alignSelf={'center'}>
  <ModalFooter>
    <Button color="black" bg="red.500" mr={3} onClick={onDeleteClose}>
      Fermer
    </Button>
    <Button color="black" bg="green.500" name="delete" onClick={(event) => deleteTicket(selectticket, event) } variant='solid'>Oui</Button>
  </ModalFooter>
  </ModalBody>
</ModalContent>
</Modal>
<Modal
isCentered
isOpen={isTicketOpen} onClose={onTicketClose}
motionPreset='slideInBottom'>
<ModalOverlay />
<ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' height={"600px"} alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
  <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Ticket : #{ticketmodal[0]?.ticket_code} <br />Sujet : {ticketmodal[0]?.subject}</center></ModalHeader>
  <ModalCloseButton />
  <ModalBody overflow={'hidden'} alignSelf={'center'}>
    <Box height="90%" overflowY="auto" overflowX="hidden">
    <ul>
    {ticketmodal && ticketmodal.length > 0 && ticketmodal?.map((e, i) => {
      return getTicketMessages(e, i)
    })
  }
  </ul>
  <div ref={messagesEndRef} />
  </Box>
        <form onSubmit={onSubmit}>
        <InputGroup  m="auto" paddingBottom="0px" width={'95%'} size="md">
        <Input isDisabled={inputdisabled} onChange={(e) => setMessage(e?.target.value)} value={message} color="white" placeholder="Votre message..."  bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 76.65%)' />
        <InputRightElement>
        <Send boxSize={'24px'}/>
        </InputRightElement>
        </InputGroup>
        </form>
  </ModalBody>
  <ModalFooter>
    <Button color="black" bg="red.500" width={'100%'} mr={3} onClick={onTicketClose}>
      Fermer
    </Button>
  </ModalFooter>
</ModalContent>
</Modal>
    </Flex>
    </Card>
    </Flex>
  );
}

export default Support;
