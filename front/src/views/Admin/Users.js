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
import React, {useEffect, useState} from "react";
// Chakra imports
import { Alert, AlertIcon, Button, Flex, Text, Input, Modal, Image, IconButton,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    InputGroup,
    InputRightElement,
    ModalCloseButton, useDisclosure, SimpleGrid, Box, Icon  } from "@chakra-ui/react";
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
import { EditIcon, CloseIcon, CheckIcon, RepeatIcon } from '@chakra-ui/icons'
import {useForm} from 'react-hook-form';
function Support() {
    const { isOpen: isDeleteOpen , onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isTicketOpen , onOpen: onTicketInfos, onClose: onTicketClose } = useDisclosure()
    const { socket } = useTchat();
    const [loading, setLoading] = useState(false)
    const [show, setShow] = useState(false);
    const [show1, setShow1] = useState(false);
    const [usersfiltered, setUsersFiltered] = useState([]);
    const [actualleading, setActualLeading] = useState();
    const [actualadmin, setActualAdmin] = useState();
    const [actualavatar, setActualAvatar] = useState('');
    const [actualusername, setActualUsername] = useState('');
    const [actualemail, setActualEmail] = useState('');
    const [actualfirstname, setActualFirstname] = useState('');
    const [actuallastname, setActualLastname] = useState('');
    const [actualpassword, setActualPassword] = useState('');
    const [actualpasswordconfirm, setActualPasswordConfirm] = useState('');
    const [actualkoalacoins, setActualKoalaCoins] = useState('');
    const [actualgrade, setActualGrade] = useState('');
    const [editusername, setEditUsername] = useState(false);
    const [editemail, setEditEmail] = useState(false);
    const [editfirstname, setEditFirstname] = useState(false);
    const [editlastname, setEditLastname] = useState(false);
    const [editpassword, setEditPassword] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordconfirm, setPasswordConfirm] = useState();
    const [errormodal, setErrorModal] = useState(false)
    const [successmodal, setSuccessModal] = useState(false)
    const [searchvalue, setSearchValue] = useState(""); 
    const [loadingmodal, setLoadingModal] = useState(false)
    const [gotloaded, setGotLoaded] = useState(false)
    const [error, setError]= useState();
    const [selectuser, setSelectedUser] = useState()
    const [success, setSuccess] = useState('');
    const [pageNumber, setPageNumber] = useState(0);
    const [users, setUsers] = useState([])
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
      const filtered = users.filter((el) => {
        if(value == ""  && !valuefiltered || value.length <= 1 && !valuefiltered) {
          return el;
        } else if(value == ""  && valuefiltered || value.length <= 1 && valuefiltered) {
          return el;
        }
        else if (el.username.toLowerCase().includes(value.toLowerCase()) && value.length >= 2){
          return el ;
        }
        else if (el.email.toLowerCase().includes(value.toLowerCase()) && value.length >= 2){
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
        setUsersFiltered(filtered)
        setValueFiltered(true)
      }
    }
    async function openModal (id, event) {
      if(isNaN(id)) {
        return setErrorModal("Veuillez vérifier l'ID.")
      }
      const controller = new AbortController();
      await axiosPrivate.get(`/admin/list-details/user/${id}`, { signal: controller.signal })
      .then((e) => {
        if(e?.status === 201) {
          setSelectedUser(id)
          setActualUsername(e.data.username);
          setActualEmail(e.data.email);
          setActualFirstname(e.data.firstname);
          setActualLastname(e.data.lastname);
          setActualAdmin(e.data.isadmin);
          setActualLeading(e.data.isLeading);
          setActualKoalaCoins(e.data.koalacoin);
          setActualGrade(e.data.grade)
          setActualPassword('*******');
          setActualPasswordConfirm('*******');
          setActualAvatar(require('images/avatar/'+e.data.avatar_path));
          setLoading(false)
          setGotLoaded(true)
        }
        else {
          setErrorModal(e?.data.error)
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      }).finally((e) => { onTicketInfos(event) })
      
    }
    const handleClick = () => setShow(!show)
    const handleClick1 = () => setShow1(!show1)
    function isValidEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
    }
    function isValidString(string) {
      return /^([a-zA-Z]+\s)*[a-zA-Z]+$/.test(string);
    }
    const controller = new AbortController();
    const onSubmitUsername = async (data)=>{ 
        if(data.username.length > 5) {
          await axiosPrivate.patch('/admin/infos/user', {id: selectuser, username: data.username}, { signal : controller.signal}).then(e => {
          if(e.status === 201) {
            setUsername('');
            setActualUsername(data.username);
            setSuccessModal('Pseudo bien mis à jour.')
            setErrorModal(false);
            setEditUsername(false);
            reset();
            } else {
              setSuccessModal(false)
              setErrorModal(e.data.error)
            }
          }).catch((e) => {
            if(socket) {
              socket.disconnect()
            }
            return navigate('/auth/signin', { state: { from: location }, replace: true });
          })
        }
        if(data.username.length === 0) {
          setSuccessModal(false);
          setErrorModal('Veuillez saisir un pseudo.');
        }
        if(data.username.length < 5) {
          setSuccessModal(false);        
          setErrorModal('Veuillez saisir un pseudo de minimum 5 caractères.')
        }
        if(data.username.length > 32) {
          setSuccessModal(false);
          setErrorÙpdam('Veuillez saisir un pseudo de maximum 32 caractères.')
        }
    } ;
    const onSubmitEmail = async (data)=>{ 
      if(isValidEmail(data.email)) {
        await axiosPrivate.patch('/admin/infos/user', {id: selectuser, email: data.email}, { signal : controller.signal}).then(e => {
          if(e.status === 201) {
        setEmail('');
        setActualEmail(data.email);
        setEditEmail(false);
        setSuccessModal('E-Mail bien mis à jour.')
        setErrorModal(false);
        reset();
      }  else {
        setSuccessModal(false)
        setErrorModal(e?.data?.error??'Un Problème est survenu.')
      }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })
    } 
      else {
        setSuccess(false);
        setError('Veuillez vérifier le Mail saisis.');
      }};
  const onSubmitFirstname = async (data)=>{ 
    if(isValidString(data.firstname) && data.firstname.length > 2) {
      await axiosPrivate.patch('/admin/infos/user', {id: selectuser, firstname: data.firstname}, { signal : controller.signal}).then(e => {
      if(e.status === 201) {
    setError(false);
    setSuccessModal('Prénom bien mis à jour.')
    setFirstname('');
    setActualFirstname(data.firstname);
    setEditFirstname(false);
    reset();
    } else {
      setSuccessModal(false)
      setErrorModal('Veuillez vérifier le prénom saisis.')
      }
    }).catch((e) => {
      if(socket) {
        socket.disconnect()
      }
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    })  } };
  const onSubmitLastname = async (data)=>{ 
    if(isValidString(data.lastname) && data.lastname.length > 2) {
    await axiosPrivate.patch('/admin/infos/user', {id: selectuser,lastname: data.lastname}, { signal : controller.signal}).then(e => {
      if(e.status === 201) {
    setErrorModal(false);
    setSuccessModal('Nom bien mis à jour.')
    setLastname('');
    setActualLastname(data.lastname);
    setEditLastname(false);
    reset();
    } else {
      setSuccessModal(false)
      setErrorModal('Veuillez vérifier le nom saisis.')
    }
  }).catch((e) => {
    if(socket) {
      socket.disconnect()
    }
    return navigate('/auth/signin', { state: { from: location }, replace: true });
  })
  }};
  const onSubmitPassword = async (data)=>{ 
    if(data.password.toString()) {
      await axiosPrivate.patch('/admin/infos/user', {id: selectuser, password: data.password }, { signal : controller.signal}).then(e => {
      if(e.status === 201) {
      setErrorModal(false);
      setSuccessModal('Mot de passe bien changé');
      setPassword('');
      setPasswordConfirm('');
      setActualPasswordConfirm('******');
      setActualPassword('******');
      setEditPassword(false);
      reset();
      if(data.password.length < 6 || data.passwordconfirm.length < 6) {
        setSuccessModal(false)
        setError('Le mot de passe doit faire au minimum 6 caractères.')
      }
    }
  }).catch((e) => {
    if(socket) {
      socket.disconnect()
     }
    return navigate('/auth/signin', { state: { from: location }, replace: true });
  })  
  }else {
      setSuccessModal(false)
      setErrorModal('Veuillez saisir un mot de passe.')
    }
  };
    const deleteUser = async (value, event) => {
      if(isNaN(value)) {
       return setError('Veuillez vérifier l\'ID de l\'utilisateur')
      }
      await axiosPrivate.delete(`/admin/delete-user/${value}`).then((res) => {
        if(res?.status === 201) {
            const ticketFiltered = users.filter(x => parseInt(x.id) !== parseInt(value));
            setUsers(ticketFiltered)
        } else {
          setError(res?.data?.error)
        }
      })
      onDeleteClose(event)
    }
    useEffect(async () => {
        document.title = "KoalaBestBet - Admin - Gestion Utilisateurs"
        let isMounted = true
        if(isMounted) {
          setLoading(true)
          await axiosPrivate.get('/admin/list-users/some-infos', {signal: controller.signal}).then((res) => {
              if(res?.status === 201) {
                  setUsers(res.data)
                  setLoading(false)
              } else {
                  setLoading(false)
                  setError(res?.data?.error)
              }
          })
        }
        return () => {
          isMounted = false
          controller.abort()
        }
    }, [])
    useEffect( async () => {
      let isMounted = true
      if(isTicketOpen && !gotloaded && isMounted) {
        setLoadingModal(true)
        await axiosPrivate.get(`/admin/list-details/user/${parseInt(selectuser)}`, {signal: controller.signal}).then((e) => {
          if(e?.status === 201){
            setActualUsername(e.data.username);
            setActualEmail(e.data.email);
            setActualFirstname(e.data.firstname);
            setActualLastname(e.data.lastname);
            setActualKoalaCoins(e.data.koalacoin);
            setActualGrade(e.data.grade)
            setActualPassword('*******');
            setActualPasswordConfirm('*******');
            setActualAvatar(require('images/avatar/'+e.data.avatar_path));
            setLoading(false)
            setGotLoaded(true)
          } else {
            setError(e?.data.error??'Un Problème est survenu.')
            setLoadingModal(false)
          }          
        }).catch((e) => {
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
    }, [isTicketOpen, socket])
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
                  <AlertIcon />Page de gestion des utilisateurs, permet de modifier les infos d'un utilisateur, ou de supprimer un compte.</Alert>
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
        placeholder="Saisissez votre recherche..."
          borderRadius='inherit'
          />
        </InputGroup>
        </Flex>
        </Card>
    {loading ?
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
              : users && users.length > 0 && searchvalue.length === 0 ? users.slice(pagesVisited, pagesVisited + usersPerPage).map((e, i, arr) => {
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
        <Text color='gray.400' a="span" fontSize='s'>
        Pseudo :
        </Text>
         <Text as='span' color='white'>
           {e?.username}
        </Text>
        </Card>
        <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} backdropFilter='blur(42px)' borderRadius="1em" p='1em' alignItems='center'>
        <Text color='gray.400' a="span" fontSize='s'>
        Email :
        </Text>
         <Text as='span' color='white'>
           {e?.email}
        </Text>
        </Card>
      <Button
variant='no-hover'
mb={{ sm: "10px", md: "0px" }}
me={{ md: "12px" }} color='green.500'
size='lg'
onClick={(event) => {  openModal(e?.id, event);} } cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" justifyContent={'center'} backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
  <Icon as={FaPaperPlane} me='4px' w='16px' h='16px' />
  <Text fontSize='xs' color='gray.400'>Editer Infos</Text>
</Button>
<Button
variant='no-hover'
mb={{ sm: "10px", md: "0px" }}
me={{ md: "12px" }} color='red.500'
size='lg'
bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={(ev) => {onDeleteOpen(e?.id, ev); } }
justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
  <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
  <Text fontSize='xs' color='gray.400'>Supprimer l'utilisateur</Text>
</Button>
</SimpleGrid>
</Box>
</SimpleGrid>
</Card>
       )
        }) : usersfiltered && usersfiltered.length > 0 && valuefiltered && usersfiltered.slice(pagesVisited, pagesVisited + usersPerPage).map((e, i, arr) => {
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
            <Text color='gray.400' a="span" fontSize='s'>
            Pseudo :
            </Text>
             <Text as='span' color='white'>
               {e?.username}
            </Text>
            </Card>
            <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} backdropFilter='blur(42px)' borderRadius="1em" p='1em' alignItems='center'>
            <Text color='gray.400' a="span" fontSize='s'>
            Email :
            </Text>
             <Text as='span' color='white'>
               {e?.email}
            </Text>
            </Card>
          <Button
    variant='no-hover'
    mb={{ sm: "10px", md: "0px" }}
    me={{ md: "12px" }} color='green.500'
    size='lg'
    onClick={(event) => { openModal(e?.id, event); } } cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" justifyContent={'center'} backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
      <Icon as={FaPaperPlane} me='4px' w='16px' h='16px' />
      <Text fontSize='xs' color='gray.400'>Editer Infos</Text>
    </Button>
    <Button
    variant='no-hover'
    mb={{ sm: "10px", md: "0px" }}
    me={{ md: "12px" }} color='red.500'
    size='lg'
    bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={(ev) => {onDeleteOpen(ev); setSelectedUser(e?.ticket_code)} }
    justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
      <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
      <Text fontSize='xs' color='gray.400'>Supprimer l'utilisateur</Text>
    </Button>
    </SimpleGrid>
    </Box>
    </SimpleGrid>
    </Card> )})}
        {usersfiltered.length > usersPerPage && valuefiltered ?
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(usersfiltered.length)}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
        </Card>
         : 
        users.length > usersPerPage && !valuefiltered &&
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(users.length)}
        onPageChange={changePage}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
        </Card>
          }
        <Modal
isCentered
isOpen={isDeleteOpen} onClose={onDeleteClose}
motionPreset='slideInBottom'>
<ModalOverlay />
<ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
  <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Êtes-vous sur de vouloir supprimer l'utilisateur ? <Text as="span">{}</Text></center></ModalHeader>
  <ModalCloseButton />
  <ModalBody alignSelf={'center'}>
  <ModalFooter>
    <Button color="black" bg="red.500" mr={3} onClick={onDeleteClose}>
      Fermer
    </Button>
    <Button color="black" bg="green.500" name="delete" onClick={(event) => deleteUser(selectuser, event) } variant='solid'>Oui</Button>
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
  <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Pseudo : {actualusername} </center></ModalHeader>
  <ModalCloseButton />
  <ModalBody alignSelf={'center'} overflow="auto">
  {loading? 
        <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
        :
        <Card p='16px' marginTop=".2em" marginBottom=".2em" flexDirection="column" alignItems="center">
                            {errormodal &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{errormodal}</Alert>
                  </Card>
        }
          {successmodal &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
            <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{successmodal}</Alert>
                  </Card>
                    }
                <Flex direction='column' alignItems={'stretch'}>
                  <div style={{marginInline: 'auto'}}>
                  <div style={{display:'table'}}>
                  <div style={{position: 'relative', display:'table-cell', verticalAlign:'middle', textAlign: 'center'}}>
                  <Image borderRadius='50%' boxSize='60px' src={actualavatar} />
                  </div>
                   </div>
                   </div>
                   <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Vos KoalaCoins : {actualkoalacoins}</Text>
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Votre Grade : {actualgrade}</Text>
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Role: {actualadmin?'Administrateur':'Utilisateur'}</Text>
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Actuellement Leader : {actualleading?'Oui':'Non'}</Text>
                   </Card>
                   <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
                <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Pseudo</Text>
                <Flex direction='row' minWidth='45%' alignItems="center">
                    <Input                
                    id="username"
                    m=".4em"
                    value={username}
                    placeholder={actualusername}
                    style={{color:'white', fontStyle:'italic'}}
                    name="username"
                    {...register('username')}
                    onChange={(e)=>setUsername(e.target.value)} readOnly={!editusername} focusBorderColor='#A0AEC0'/>
                    {editusername === false &&
                      <EditIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditUsername(prevState => !prevState)}} w={6} h={6}/>
                    }
                    {editusername === true &&
                      <>
                      <CloseIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditUsername(prevState => !prevState)}} w={6} h={6} marginRight=".2em" />
                      <CheckIcon style={{cursor:'pointer'}} color='white' type="Submit" onClick={handleSubmit(onSubmitUsername)}  w={6} h={6}/>
                      </>
                     }
                
                </Flex>
                <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>E-Mail</Text>
                <Flex direction='row' minWidth='45%' alignItems="center">
                <Input 
                m=".4em" 
                name="mail"            
                id="mail"
                type="email"
                style={{color:'white'}}
                value={email}
                placeholder={actualemail}          
                  {...register('email')}
                    onChange={(e)=>setEmail(e.target.value)} readOnly={!editemail} focusBorderColor='#A0AEC0'/>
                {editemail === false &&
                      <EditIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditEmail(prevState => !prevState)}} w={6} h={6}/>
                    }
                    {editemail === true &&
                      <>
                      <CloseIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditEmail(prevState => !prevState)}} w={6} h={6} marginRight=".2em" />
                      <CheckIcon style={{cursor:'pointer'}} color='white' type="Submit" onClick={handleSubmit(onSubmitEmail)}  w={6} h={6}/>
                      </>
                     }
                </Flex>
                <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Prénom</Text>
                <Flex direction='row' minWidth='45%' alignItems="center">
                <Input    
                m=".4em"            
                id="firstname"
                name="firstname"
                style={{color:'white'}}
                placeholder={actualfirstname}              
                value={firstname}
                {...register('firstname')}
                onChange={(e)=>setFirstname(e.target.value)} readOnly={!editfirstname} focusBorderColor='#A0AEC0'/>
                {editfirstname === false &&
                      <EditIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditFirstname(prevState => !prevState)}} w={6} h={6}/>
                    }
                    {editfirstname === true &&
                      <>
                      <CloseIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditFirstname(prevState => !prevState)}} w={6} h={6} marginRight=".2em" />
                      <CheckIcon style={{cursor:'pointer'}} color='white' type="Submit" onClick={handleSubmit(onSubmitFirstname)}  w={6} h={6}/>
                      </>
                     }
                </Flex>
                <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Nom</Text>
                <Flex direction='row' minWidth='45%' alignItems="center">
                <Input  
                m=".4em"              
                id="lastname"
                name="lastname"
                style={{color:'white'}}
                placeholder={actuallastname}             
                value={lastname}
                {...register('lastname')}
                onChange={(e)=>setLastname(e.target.value)} readOnly={!editlastname} focusBorderColor='#A0AEC0'/>
                {editlastname === false &&
                      <EditIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditLastname(prevState => !prevState)}} w={6} h={6}/>
                    }
                    {editlastname === true &&
                      <>
                      <CloseIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditLastname(prevState => !prevState)}} w={6} h={6} marginRight=".2em" />
                      <CheckIcon style={{cursor:'pointer'}} color='white' type="Submit" onClick={handleSubmit(onSubmitLastname)}  w={6} h={6}/>
                      </>
                     }
                </Flex>
                <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Mot de passe</Text>
                <Flex direction='row' minWidth='45%' alignItems="center">
                
                {editpassword === false &&
                <>
                <InputGroup size='md'>
                <Input  
                m=".4em"              
                id="password"
                name="password"
                style={{color:'white'}}
                placeholder={actualpassword} readOnly={!editpassword} focusBorderColor='#A0AEC0'/>
                  </InputGroup>
                      <EditIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditPassword(prevState => !prevState)}} w={6} h={6}/>
                      </>
                    }
                    {editpassword === true &&
                      <>
                      <InputGroup size='md'>
                <Input  
                m=".4em"              
                id="password"
                name="password"
                style={{color:'white'}}
                placeholder={actualpassword}           
                value={password}
                {...register('password')}
                type={show ? 'text' : 'password'}
                onChange={(e)=>setPassword(e.target.value)} readOnly={!editpassword} focusBorderColor='#A0AEC0'/>
                    <InputRightElement paddingTop="1em" width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                    {show ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
                      <CloseIcon style={{cursor:'pointer'}} color='white' onClick={() => {setEditPassword(prevState => !prevState)}} w={6} h={6} marginRight=".2em" />
                      <CheckIcon style={{cursor:'pointer'}} color='white' type="Submit" onClick={handleSubmit(onSubmitPassword)}  w={6} h={6}/>
                     
                  
                      </>
                     }
                     </Flex>
                     {editpassword === true &&
                     <>
                     <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Confirmation</Text>
                     <Flex direction='row' minWidth='45%' alignItems="center">
                     <InputGroup size='md'>
                     <Input  
                    m=".4em"              
                    id="passwordconfirm"
                   name="passwordconfirm"
                    style={{color:'white'}}
                    placeholder={'*******'}      
                    value={passwordconfirm}
                    type={show1 ? 'text' : 'password'}
                  {...register('passwordconfirm')}
                  onChange={(e)=>setPasswordConfirm(e.target.value)} readOnly={!editpassword} focusBorderColor='#A0AEC0'/>
                    <InputRightElement paddingTop="1em" width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick1}>
                    {show1 ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
                     
                </Flex>
                    </>
                     }
                     </Card> 
                     </Flex>
                </Card>
                }
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
