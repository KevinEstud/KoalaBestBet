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
import React, { useEffect, useState} from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"
// Chakra imports
import {
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Image,
  Flex,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import {useForm} from 'react-hook-form';
// Images
import './Try.css'
// Custom components
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import useAxiosPrivate from "hooks/useAxiosPrivate";
// Icons
import { useNavigate, useLocation } from "react-router-dom";
import { EditIcon, CloseIcon, CheckIcon, RepeatIcon } from '@chakra-ui/icons'
import useAuth from "hooks/useAuth";
import useTchat from "hooks/useTchat";
function Profile() {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const {socket} = useTchat()
  const [actualavatar, setActualAvatar] = useState('');
  const [loading, setLoading] = useState(false)
  const [actualusername, setActualUsername] = useState('');
  const [actualemail, setActualEmail] = useState('');
  const [actualfirstname, setActualFirstname] = useState('');
  const [actuallastname, setActualLastname] = useState('');
  const [actualpassword, setActualPassword] = useState('');
  const [actualpasswordconfirm, setActualPasswordConfirm] = useState('');
  const [actualkoalacoins, setActualKoalaCoins] = useState('');
  const [actualgrade, setActualGrade] = useState('');
  const { isOpen: isEditOpen , onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const [editusername, setEditUsername] = useState(false);
  const [editemail, setEditEmail] = useState(false);
  const [editfirstname, setEditFirstname] = useState(false);
  const [editlastname, setEditLastname] = useState(false);
  const [editpassword, setEditPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordconfirm, setPasswordConfirm] = useState();
  const [changeavatar, setChangeAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location  = useLocation();
  const { register, handleSubmit, reset } = useForm();
  const {auth, setAuth} = useAuth();
  const handleClick = () => setShow(!show)
  const handleClick1 = () => setShow1(!show1)
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  function isValidString(string) {
    return /^([a-zA-Z]+\s)*[a-zA-Z]+$/.test(string);
  }
  const controller = new AbortController();
  const confirmDelete = async () => {
    await axiosPrivate.delete('/delete-account').then(e => {
      if(e?.status === 201) {
        setAuth({})
        navigate("/auth/signin")
      } else {
        setError(e?.data.error)
      }
    }).catch((e) => {
      if(socket) {
        socket.disconnect()
       }
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    }) 
  }
  const onSubmitUsername = async (data)=>{ 
      if(data.username.length > 5) {
        await axiosPrivate.patch('/infos/user/username', {username: data.username}, { signal : controller.signal}).then(e => {
        if(e.status === 201) {
          setUsername('');
          setActualUsername(data.username);
          setSuccess('Pseudo bien mis à jour.')
          setError(false);
          setEditUsername(false);
          setAuth(prev => {
            return {
                ...prev,
                username: data.username,
            }
        });
          reset();
          } else {
            setSuccess(false)
            setError(e.data.error)
          }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
           }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
      }
      if(data.username.length === 0) {
        setSuccess(false);
        setError('Veuillez saisir un pseudo.');
      }
      if(data.username.length < 5) {
        setSuccess(false);        
        setError('Veuillez saisir un pseudo de minimum 5 caractères.')
      }
      if(data.username.length > 32) {
        setSuccess(false);
        setError('Veuillez saisir un pseudo de maximum 32 caractères.')
      }
  } ;
  const onSubmitEmail = async (data)=>{ 
    if(isValidEmail(data.email)) {
      await axiosPrivate.patch('/infos/user/email', {email: data.email}, { signal : controller.signal}).then(e => {
        if(e.status === 201) {
      setEmail('');
      setActualEmail(data.email);
      setEditEmail(false);
      setSuccess('E-Mail bien mis à jour.')
      setError(false);
      reset();
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
    await axiosPrivate.patch('/infos/user/firstname', {firstname: data.firstname}, { signal : controller.signal}).then(e => {
    if(e.status === 201) {
  setError(false);
  setSuccess('Prénom bien mis à jour.')
  setFirstname('');
  setActualFirstname(data.firstname);
  setEditFirstname(false);
  reset();
  } else {
    setSuccess(false)
    setError('Veuillez vérifier le prénom saisis.')
    }
  }).catch((e) => {
    if(socket) {
      socket.disconnect()
     }
    return navigate('/auth/signin', { state: { from: location }, replace: true });
  })   } };
const onSubmitLastname = async (data)=>{ 
  if(isValidString(data.lastname) && data.lastname.length > 2) {
  await axiosPrivate.patch('/infos/user/lastname', {lastname: data.lastname}, { signal : controller.signal}).then(e => {
    if(e.status === 201) {
  setError(false);
  setSuccess('Nom bien mis à jour.')
  setLastname('');
  setActualLastname(data.lastname);
  setEditLastname(false);
  reset();
  } else {
    setSuccess(false)
    setError('Veuillez vérifier le nom saisis.')
  }
}).catch((e) => {
  if(socket) {
    socket.disconnect()
   }
  return navigate('/auth/signin', { state: { from: location }, replace: true });
})  
}};
const onSubmitPassword = async (data)=>{ 
  if(data.password.toString() === data.passwordconfirm.toString()) {
    await axiosPrivate.patch('/infos/user/password', {password: data.password, passwordconfirm: data.passwordconfirm}, { signal : controller.signal}).then(e => {
    if(e.status === 201) {
    setError(false);
    setSuccess('Mot de passe bien changé');
    setPassword('');
    setPasswordConfirm('');
    setActualPasswordConfirm('******');
    setActualPassword('******');
    setEditPassword(false);
    reset();
    if(data.password.length < 6 || data.passwordconfirm.length < 6) {
      setSuccess(false)
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
    setSuccess(false)
    setError('Les deux mots de passe doivent correspondre.')
  }
};
const onClickAvatar = async () =>{ 
  setChangeAvatar(true);
  await axiosPrivate.patch('/infos/user/picture').then(e => {
    if(e.status === 201) {
      setActualAvatar(require('images/avatar/'+e.data.new_path));
    }
    }).catch((e) => {
      if(socket) {
        socket.disconnect()
       }
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    })  
    return setTimeout(() => setChangeAvatar(false), 1500)
} ;
useEffect(async ()=>{
  document.title = "KoalaBestBet - Mon Profil"
  setLoading(true)
  let isMounted = true; 
  if(isMounted) {
    await axiosPrivate.get('/infos/user', { signal : controller.signal}).then(e => {
      if(e.status === 201 && isMounted) {
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
      } else {
        setError(e.data.error)
      }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
         }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    }
    return () => {
      isMounted = false;
      controller.abort()
    }
}, [])
// let image = require("images/avatar/ava_5.jpeg");
  return (
    <Flex direction='column' mx='auto' alignItems={'center'}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Mon Profil
          </Text>
        </CardHeader>
      </Card>
      {success &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{success}</Alert>
                  </Card>
        }
      {error &&
                  <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
        {loading? 
        <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
        :
        <Card p='16px' marginTop=".2em" marginBottom=".2em" flexDirection="column" alignItems="center">
                <Flex direction='column' alignItems={'stretch'}>
                  <div style={{marginInline: 'auto'}}>
                  <div style={{display:'table'}}>
                  <div style={{position: 'relative', display:'table-cell', verticalAlign:'middle', textAlign: 'center'}}>
                  <Image borderRadius='50%' boxSize='150px' src={actualavatar} />
                  {!changeavatar &&
                  <RepeatIcon  onClick={onClickAvatar} style={{ position: 'absolute', bottom:0,  color: 'white', cursor:'pointer' }} h={6} w={6}/>
                  }
                  {changeavatar&&
                  <RepeatIcon style={{ position: 'absolute', bottom:0,  color: 'gray'}} h={6} w={6}/>
                  }
                  </div>
                   </div>
                   </div>
                   <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Vos KoalaCoins : {actualkoalacoins}</Text>
                   <Text marginLeft={'auto'} marginRight='auto' color={'white'} fontWeight='bold'>Votre Grade : {actualgrade}</Text>
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
                     <Button marginTop='.4em' onClick={onEditOpen}>Supprimer mon compte</Button>
          <Modal
            isCentered
            isOpen={isEditOpen} onClose={() => {onEditClose(); setError(false);}}
            motionPreset='slideInBottom'
            >
            <ModalOverlay />
            <ModalContent marginRight=".5em" marginLeft=".5em" alignItems='center' bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)'>
              <ModalHeader color='whiteAlpha.800' isCentered>Êtes-vous sur de vouloir supprimer votre compte ? Cette action est irréversible.</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              <ModalFooter alignSelf={'center'}>
                <Button colorScheme='red' mr={3} onClick={() => {onEditClose(); setError(false);}}>
                  Fermer
                </Button>
                <Button colorScheme="blue" type="submit" onClick={() => {confirmDelete();}} variant='ghost'>Supprimer</Button>
              </ModalFooter>
              </ModalBody>
                </ModalContent>
                    </Modal>
                     </Flex>
                </Card>
                }
    </Flex>
  );
}

export default Profile;
