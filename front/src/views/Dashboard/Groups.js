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

import { React, useState, useEffect } from "react";

// Chakra imports
import {
  Alert,
  AlertIcon,
  Box, 
  Button,
  Flex,
  Icon,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  Input,
  SimpleGrid
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { GiPodium } from "react-icons/gi";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import useAuth from 'hooks/useAuth';
import useTchat from "hooks/useTchat";
import { useLocation, useNavigate } from "react-router-dom"
import bckgd1 from "assets/img/csgo1.jpg";
import bckgd2 from "assets/img/csgo2.png";
import bckgd3 from "assets/img/csgo3.jpg";
import bckgd4 from "assets/img/csgo4.png";
import useAxiosPrivate from "hooks/useAxiosPrivate";
const images = [
  bckgd1,
  bckgd2,
  bckgd3,
  bckgd4
]
function Tables() {
  const { isOpen: isEditOpen , onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen , onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isLeaveOpen , onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
  const [groupmodal, SetGroupModal] = useState({
    name: "",
    id: ""
  })
  const [invitation, setInvitation]= useState({invitation_link: ""});
  const [dataGroup,setDataGroup] = useState([]);
  const [error, setError] = useState(false);
  const { auth, setAuth } = useAuth(); 
  const location = useLocation();
  const { socket }  = useTchat();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate(); 
  const controller = new AbortController();
 async function requestListGroupsByUser() {
   const response = await axiosPrivate.get('/list/groups/user',{signal: controller.signal}).then(res => res).catch((e) => {
     if(socket) {
      socket.disconnect()
     }
    return navigate('/auth/signin', { state: { from: location }, replace: true });
  })  
   return response;
  }
  function gonnaLeave(id, name) {
    SetGroupModal({
      name: name,
      id: id
    })
    onLeaveOpen()
  }
  function gonnaDelete(id, name) {
    SetGroupModal({
      name: name,
      id: id
    })
    onDeleteOpen()
  }
  function getGroupOfUserRender(groupInfos) { 
    for(let a = 0; a < groupInfos.length; a++) {
      groupInfos[a].bg_image = images[Math.ceil(Math.random() * images.length -1)];
    }  
      setDataGroup(groupInfos)   
    }
    const onChange = (e) => {
      setInvitation({...invitation, [e.target.name]:e.target.value})
    }
    const confirmLeave = async (e, id) => {
      if(isNaN(id)) {
        setError('Veuillez vérifier le groupe.')
      }
      e.preventDefault();
      await axiosPrivate.delete(`/delete-group/group/${id}`, {signal: controller.signal}).then(res => {
        if(res?.status === 201) {
           if(e.target.getAttribute('aria-label') === 'false') {
             socket.emit("delete_group", { group_id: id })
           } else {
            socket.emit("leaving_group", { group_id: id })
           }
          const dataGroupFiltered = dataGroup.filter((item)=> item.group_id !== id);
          setDataGroup(dataGroupFiltered)
          onLeaveClose(e)
          if(e.target.name === "delete") {
            setAuth(prev => {
              return {
                  ...prev,
                  isLeading: false
              }
          })
          }
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
         }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    }
    const confirmJoin = async (e) => {
      e.preventDefault();
      await axiosPrivate.get(`/invite/${invitation.invitation_link}`, {signal: controller.signal}).then(res => {
        if(res.status === 201) {
          setError(false)
          requestListGroupsByUser().then(response => {
            if(response.status === 201) {
              onEditClose();
              onDeleteClose();
              getGroupOfUserRender(response.data);    
            } else {
              setError(response.data?.error)
            }
          });
        } else {
          setError(res.data.error)
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
         }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    }
  useEffect(async () => {
    document.title = "KoalaBestBet - Mes Groupes"
    let isMounted = true ;
    const response = await requestListGroupsByUser().then(res => res).catch((e) => {
      if(socket) {
        socket.disconnect()
       }
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    });
      if(response.status === 201 && isMounted) {
        getGroupOfUserRender(response.data);    
      } else {
        setError(response.data.error)
      }
      return () => {
        isMounted = false ;
        controller.abort()
      }
  },[]);
  useEffect(() => {
    let isMounted = true;
    socket.on("group_deleted", (grp) => {
      if(isMounted) {
          const dataGroupFiltered = dataGroup.filter((item)=> parseInt(item.group_id) !== parseInt(grp?.group_id));
          setDataGroup(dataGroupFiltered)
        }
    })
    socket.on("group_full", (grp) => {
      if(dataGroup && isMounted) {
          const dataGroupFiltered =  dataGroup.map(x => (parseInt(x.group_id) === parseInt(grp?.group_id) ? { ...x, nb_participants: parseInt(x.nb_participants) + 1 } : x));
          setDataGroup(dataGroupFiltered)
        }
    })
    socket.on("player_joined", (grp) => {
      if(dataGroup && isMounted) {
          const dataGroupFiltered =  dataGroup.map(x => (parseInt(x.group_id) === parseInt(grp?.group_id) ? { ...x, nb_participants: parseInt(x.nb_participants) + 1 } : x));
          setDataGroup(dataGroupFiltered)
        }
    })
    socket.on("player_leaved", (grp) => {
      if(dataGroup && isMounted) {
          const dataGroupFiltered =  dataGroup.map(x => (parseInt(x.group_id) === parseInt(grp?.group_id) ? { ...x, nb_participants: parseInt(x.nb_participants) - 1 } : x));
          setDataGroup(dataGroupFiltered)
        }
    })
    return () => {
      isMounted = false
    }
 }, [setDataGroup, dataGroup, dataGroup?.group_id, socket])
  return (
    
    <Flex direction='column' mx='auto'>
      {/* Mes Groupes */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Mes Groupes
          </Text>
        </CardHeader>
      </Card>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} m='.2em'>
        <Button onClick={onEditOpen}>Rejoindre un groupe</Button>
          <Modal
            isCentered
            isOpen={isEditOpen} onClose={() => {onEditClose(); setError(false);}}
            motionPreset='slideInBottom'
          >
            <ModalOverlay />
            <ModalContent marginRight=".5em" marginLeft=".5em" alignItems='center' bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)'>
              <ModalHeader color='whiteAlpha.800' isCentered>Saisissez votre code d'invitation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              <form onSubmit={confirmJoin} className="ModalJoin">
            <FormControl variant="outlined">
              <Input
              sx={{ width:'300px'}} color="whiteAlpha.800" name="invitation_link" value={invitation.invitation_link} onChange={onChange} placeholder="mon code d'invitation..."
              />
            </FormControl>
              <ModalFooter alignSelf={'center'}>
                <Button color="black" bg="red.500" mr={3} onClick={() => {onEditClose(); setError(false);}}>
                  Fermer
                </Button>
                <Button color="black" bg="green.500" type="submit" variant='solid'>Rejoindre</Button>
              </ModalFooter>
            </form>  
              </ModalBody>
            </ModalContent>
          </Modal>
      </Card>
      <Card my={{ lg: ".2em" }} me={{ lg: "24px" }}  marginTop=".2em">
      {!error ?

          <Flex direction='column'>
            <CardBody>
              <Flex direction='column' w='100%'>
                {
                  dataGroup.length === 0 ? 
                  <Alert status='info' borderRadius='12px' flexDirection='row' justifyContent='center' m='.2em'>
                  <AlertIcon />Aucun Groupe Rejoins</Alert>
                  : 
                  dataGroup.map((row, i) => {
                    return (
                      <SimpleGrid minChildWidth='120px' spacing={'40px'}>
                      <Box
                      p='24px'
                      bgImage={row?.bg_image}
                      bgPosition="0 -21em"
                      my='22px'
                      alignItems={'center'}
                      justifyContent="center"
                      borderRadius='20px'>
                        <SimpleGrid minChildWidth='120px' spacing={'40px'} alignItems='center'>
        <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" justifyContent={'center'} backdropFilter='blur(42px)' maxWidth={'250px'} borderRadius="1em" p='1em' alignItems='center'>
          <Text color='gray.400' fontSize='s'>
            <Text as='span' color='white'>
               {row?.name}
            </Text>
          </Text>
          
          <Text color='white' fontSize='xs' flexDirection='column'>
                {row?.nb_participants !== row?.nb_participants_max && row?.status === 'in progress' &&
                <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
                Status du groupe : 
                <Text as='span' color='gray' > En attente de joueurs</Text>
                <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
                {row?.nb_participants}/{row?.nb_participants_max}
                </Text>
                </Text>
              
                }
                {row?.nb_participants === row?.nb_participants_max && row?.status === 'in progress' &&
                <Text as='span' color='white'>
                  Status du groupe : 
                 <Text as='span' color='green' > Groupe Plein </Text>
                <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
              {row?.nb_participants}/{row?.nb_participants_max}
                </Text>
              </Text>
                }
                {row?.status === 'finished' &&
                <Text as='span' color='white'>
                  Status du groupe : 
                 <Text as='span' color='green' > Terminé </Text>
              </Text>
                }
                {row?.status === 'expired' &&
                <Text as='span' color='white'>
                  Status du groupe : 
                 <Text as='span' color='red' > Expiré </Text>
              </Text>
                }
            
          </Text> 
          </Card>

          {row?.hasBet === false && row?.status === 'in progress' &&
               <Button color='blue.500' align='center' p='12px' onClick={ () => { navigate(`/main/create-bet/${row.group_id}`) }} variant='no-hover' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" cursor='pointer' maxWidth={'250px'} justifyContent={'center'} borderRadius="1em" backdropFilter='blur(42px)' alignItems='center'>
                 <Icon as={FaPencilAlt} me='4px' w='14px' h='14px' />
                 <Text fontSize='xs' color='gray.400'>
                   Pronotisquer
                 </Text>
             </Button>
              }
              {row?.hasBet === true &&
               <Button color='blue.500' cursor='pointer' align='center' p='12px' onClick={ () => { navigate(`/main/group/${row.group_id}`) }} variant='no-hover' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} borderRadius="1em" backdropFilter='blur(42px)' alignItems='center'>
                 <Icon as={GiPodium} me='4px' w='14px' h='14px' />
                 <Text fontSize='xs' color='gray.400'>
                   Voir Classement
                 </Text>
             </Button>
              }
              {row?.isLeader ?
              <>
              <Button
              variant='no-hover'
              mb={{ sm: "10px", md: "0px" }}
              me={{ md: "12px" }} 
              color='red.500' align='center' p='12px'
              maxWidth={'250px'} onClick={() => gonnaDelete(row?.group_id, row?.name)} cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" justifyContent={'center'} borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'
              >
                <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
                <Text fontSize='xs' color='gray.400'>Supprimer le groupe</Text>
            </Button>
            <Modal
              isCentered
              isOpen={isDeleteOpen} onClose={onDeleteClose}
              motionPreset='slideInBottom'
            >
              <ModalOverlay />
              <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
                <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Êtes-vous sur de vouloir supprimer le groupe? <Text as='span' fontStyle={'italic'} color="blue.500">{groupmodal?.name}</Text></center></ModalHeader>
                <ModalCloseButton />
                <ModalBody alignSelf={'center'}>
                <ModalFooter>
                  <Button color="black" bg="red.500" mr={3} onClick={onDeleteClose}>
                    Fermer
                  </Button>
                  <Button color="black" bg="green.500" name="delete" aria-label={row?.isprivate} onClick={(e) => confirmLeave(e, groupmodal?.id)} variant='solid'>Oui</Button>
                </ModalFooter>
                </ModalBody>
              </ModalContent>
            </Modal>
            </>
              :
              <>
              <Button
            variant='no-hover'
            mb={{ sm: "10px", md: "0px" }}
            me={{ md: "12px" }} cursor='pointer' maxWidth={'250px'}  onClick={() => { gonnaLeave(row?.group_id, row.name) }} justifyContent={'center'} bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
            <Flex color='red.500' align='center' p='12px'>
              <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
              <Text fontSize='xs' as="span" color="gray.500">Quitter le groupe</Text>
            </Flex>
          </Button>
          <Modal
            isCentered
            isOpen={isLeaveOpen} onClose={onLeaveClose}
            motionPreset='slideInBottom'
          >
            <ModalOverlay />
            <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' marginRight=".5em" marginLeft=".5em" justifyContent='center' alignItems='center'>
              <ModalHeader color="whiteAlpha.800"><center>Êtes-vous sur de vouloir quitter le groupe? <Text as='span' fontStyle={'italic'} color="blue.500">{groupmodal?.name}</Text></center></ModalHeader>
              <ModalCloseButton />
              <ModalBody alignSelf={'center'}>
              <ModalFooter>
                <Button color="black" bg="red.500" mr={3} onClick={onLeaveClose}>
                  Fermer
                </Button>
                <Button color="black" bg="green.500" name="leave" onClick={(e) => confirmLeave(e, groupmodal?.id)} variant='solid'>Oui</Button>
              </ModalFooter>
              </ModalBody>
            </ModalContent>
          </Modal>
              </>
              }
              </SimpleGrid>
        </Box>
        </SimpleGrid>
                    );
                  })
                }
              </Flex>
            </CardBody>
          </Flex>
        
      :
        <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
        <AlertIcon />{error}</Alert>
      }
      </Card>
    </Flex>
  );
}

export default Tables;
