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
import React, {useState, useEffect} from "react";
import useTchat from 'hooks/useTchat';
import useAuth from 'hooks/useAuth';
import DashboardTableRow from "components/Tables/DashboardTableRow";
import useAxiosPrivate from "hooks/useAxiosPrivate";
// Chakra imports
import { Alert, AlertIcon, Box, Button, Flex, Icon, Text, useDisclosure,Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,ModalCloseButton,Table,Tbody,Th,Thead,Tr, SimpleGrid} from "@chakra-ui/react";
import bckgd1 from "assets/img/csgo1.jpg";
import bckgd2 from "assets/img/csgo2.png";
import bckgd3 from "assets/img/csgo3.jpg";
import bckgd4 from "assets/img/csgo4.png";
const images = [
  bckgd1,
  bckgd2,
  bckgd3,
  bckgd4
]
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { useNavigate, useLocation } from "react-router-dom";
// Icons
import { FaPencilAlt, FaTrashAlt, FaSearchPlus } from "react-icons/fa";
function FindGroup() {
    const axiosPrivate = useAxiosPrivate();
    const { auth, setAuth } = useAuth();
    const { socket }  = useTchat();
    const [allgroups, setAllGroups] = useState([]);
    const { isOpen: isDeleteOpen , onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isLeaveOpen , onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure()
    const { isOpen: isOpenInfos, onOpen: onOpenInfos, onClose: onCloseInfos } = useDisclosure();
    const location  = useLocation();
  const navigate = useNavigate();
    const [groupmodal, setGroupModal] = useState({
      name: "",
      leader_username: "",
      matchs_infos: "",
      nb_participants: "",
      nb_participants_max: "",
    });
    const [groupmodalleave, SetGroupModalLeave] = useState({
      name: "",
      id: ""
    })
    const [pageNumber, setPageNumber] = useState(0);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining]= useState();
    const [success, setSuccess]= useState();
    const [error, setError]= useState();
    const usersPerPage = 5;
    const pagesVisited = pageNumber * usersPerPage;
    const pageCount  = (element) => Math.ceil(element / usersPerPage);
    const changePage = ({ selected }) => {
      setPageNumber(selected);
    };
    const controller = new AbortController();
    function getGroupOfUserRender(groupInfos) { 
      for(let a = 0; a < groupInfos.length; a++) {
        groupInfos[a].bg_image = images[Math.ceil(Math.random() * images.length -1)];
      }
        setAllGroups(groupInfos)   
      }
      function gonnaLeave(id, name) {
        SetGroupModalLeave({
          name: name,
          id: id
        })
        onLeaveOpen()
      }
      function updateUserRender(groupInfos) { 
        groupInfos.bg_image = images[Math.ceil(Math.random() * images.length -1)];
        setAllGroups(prev => [...prev, groupInfos])   
        }
    async function openModal (group_name, event) {
      await axiosPrivate.get(`/infos/group/${group_name}/matchs`, { signal: controller.signal })
      .then((e) => {
        if(e?.status === 201) {
          setGroupModal({
            name: e?.data.name,
            leader_username: e?.data.leader_username,
            matchs_infos: e?.data.matchs_infos,
            nb_participants: e?.data.nb_participants,
            nb_participants_max: e?.data.nb_participants_max
          });
        }
        else {
          setErrorModal(e?.data.error)
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      }).finally(() => onOpenInfos(event))
      
    }
    const joinGroup = async (group_id) => {
      if(isNaN(group_id)) {
        setError('Veuillez vérifier le groupe que vous voulez rejoindre.')
      } else {
        setJoining(true)
        await axiosPrivate.post(`/join-private-group/${group_id}`, {signal: controller.signal}).then((res) => {
          if(res?.status === 201) {
            socket.emit('joining_group', { group_id: group_id })
            const dataGroupFiltered =  allgroups.map(x => (parseInt(x.group_id) === parseInt(group_id) ? { ...x, playerJoined: true } : x));
            setAllGroups(dataGroupFiltered)
            setError(false)
            setSuccess(res?.data?.success)
            setJoining(false)
          } else {
            setSuccess(false)
            setError(res?.data?.error??'Un Problème est survenu.')
          }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
      }
    }
    const confirmDelete = async (e) => {
      await axiosPrivate.delete(`/delete-group/group/${e.target.value}`, {signal: controller.signal}).then(res => {
         if(res?.status === 201) {
          socket.emit("delete_group", { group_id: parseInt(e.target.value) })
            setAuth(prev => {
              return {
                  ...prev,
                  isLeading: false
              }
          })
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    }
    const confirmLeave = async (e, id) => {
      if(isNaN(id)) {
        setError('Veuillez vérifier le groupe.')
      } else {
        await axiosPrivate.delete(`/delete-group/group/${id}`, {signal: controller.signal}).then(res => {
           if(res?.status === 201) {
            socket.emit("leaving_group", { group_id: parseInt(id) })
            const dataGroupFiltered =  allgroups.map(x => (parseInt(x.group_id) === parseInt(id) ? { ...x, playerJoined: false } : x));
            onLeaveClose(e)
            setAllGroups(dataGroupFiltered)
          }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  

      }
    }
    useEffect(async () => {
      document.title = "KoalaBestBet - Trouver un groupe"
      let isMounted = true; 
      setLoading(true)
      if(isMounted) {
        socket.emit("searching_group", auth?.username);
        socket.once("init_public_group", (grp) => {
          if(grp?.groups){
              getGroupOfUserRender(grp?.groups);
            }
            }
         );
      }
      return () => {
        isMounted = false;
        controller.abort();
      }
    }, [auth?.username]);
    useEffect(() => {
      let isMounted = true;
      socket.on("group_deleted", (grp) => {
        if(isMounted) {
            const dataGroupFiltered = allgroups.filter((item)=> parseInt(item.group_id) !== parseInt(grp?.group_id));
            setAllGroups(dataGroupFiltered)
          }
      })
      socket.on("new_group_created", (grp) => {
        if(isMounted && grp?.groups) {
          updateUserRender(grp?.groups);
        }
      })
      socket.on("group_full", (grp) => {
        if(allgroups && isMounted) {
            const dataGroupFiltered = allgroups.filter((item)=> parseInt(item?.group_id) !== parseInt(grp?.group_id));
            setAllGroups(dataGroupFiltered)
          }
      })
      socket.on("player_joined", (grp) => {
        if(allgroups && isMounted) {
            const dataGroupFiltered =  allgroups.map(x => (parseInt(x.group_id) === parseInt(grp?.group_id) ? { ...x, nb_participants: parseInt(x.nb_participants) + 1 } : x));
            setAllGroups(dataGroupFiltered)
          }
      })
      socket.on("player_leaved", (grp) => {
        if(allgroups && isMounted) {
            const dataGroupFiltered =  allgroups.map(x => (parseInt(x.group_id) === parseInt(grp?.group_id) ? { ...x, nb_participants: parseInt(x.nb_participants) - 1 } : x));
            setAllGroups(dataGroupFiltered)
          }
      })
      socket.on("new_place_avalaible", (grp) => {
        if(allgroups && isMounted) {
          updateUserRender(grp?.groups)
        }
      })
          return () => {
            isMounted = false;
            controller.abort()
          }
   }, [setAllGroups, allgroups, socket])
  //  useEffect(async () => {
  //    let isMounted = true
  //   if(isMounted) {
  //     await axiosPrivate.get('/infos/user', { signal : controller.signal}).catch((e) => {
  //         if(socket) {
  //           socket.disconnect()
  //          }
  //         return navigate('/auth/signin', { state: { from: location }, replace: true });
  //       })  
  //     }
  //     return () => {
  //       isMounted = false
  //     }
  //  },[socket])
  return (
    <Flex direction='column' mx='auto'>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Trouver un groupe
          </Text>
        </CardHeader>
      </Card>
      <Modal isOpen={isOpenInfos} size="xl" onClose={onCloseInfos} motionPreset='slideInBottom'>
        <ModalOverlay />
        <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'}>
          <ModalHeader color="whiteAlpha.800" alignSelf={'center'}>Infos du groupe</ModalHeader>
          <ModalCloseButton />
          <ModalBody color="whiteAlpha.800">
          {groupmodal?.matchs_infos?.length > 0 && Object.entries(JSON.parse(groupmodal?.matchs_infos)).length > 0 &&
        <Box
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap='2em'>
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardHeader p='12px 0px 28px 0px' flexDirection='column' justifyContent='center' alignItems={'center'}>
            <Flex>
                <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                  Leader du groupe :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{groupmodal?.leader_username}
                </Text>
              </Flex>
              <Flex>
                <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                  Membres actuel :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{groupmodal?.nb_participants} / {groupmodal?.nb_participants_max}
                </Text>
              </Flex>
            <Flex>
                <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                  Nombre de match :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{Object.entries(JSON.parse(groupmodal?.matchs_infos))?.length}
                </Text>
              </Flex>
            </CardHeader>
            <Table variant='simple' color='#fff'>
              <Thead>
                <Tr my='.8rem' ps='0px'>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Heure du match
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Nom du match
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                
              {Object.entries(JSON.parse(groupmodal.matchs_infos)).map((row, index, arr) => {
                  return (
                    <DashboardTableRow
                      matchName={row[0]}
                      begin_at={row[1]}
                      keyObj={row[0]}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
              </Tbody>
            </Table>
              </Card>
            </Box>
            }
          </ModalBody>

          <ModalFooter alignSelf={'center'}>
            <Button colorScheme='blue' mr={3} onClick={onCloseInfos}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />Sur cette page il vous est possible de rejoindre un groupe, et d'y participer avant la date et l'heure d'expiration du groupe (correspondant au début des matchs).</Alert>
                  </Card>
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='warning' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />A noter que vous pouvez rejoindre autant de groupe que vous voulez.</Alert>
                  </Card>
                  {error &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
         {success &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{success}</Alert>
                  </Card>
        }
                      <Card my={{ lg: ".2em" }} me={{ lg: "24px" }}  marginTop=".2em">

          <Flex direction='column'>
            <CardBody>
              <Flex direction='column' w='100%'>
                    {
                   allgroups.length === 0 ? 
                  <Alert status='info' borderRadius='12px' flexDirection='row' justifyContent='center' m='.2em'>
                  <AlertIcon />Aucun Groupe A Rejoindre</Alert>
                  : 
                  
                  allgroups.map((row, i) => {
                    return (
                      <SimpleGrid minChildWidth='120px' spacing={'40px'}>
                      <Box
                      p='24px'
                      bgImage={row?.bg_image}
                      bgPosition="0 -21em"
                      my='22px'
                      alignItems={'center'}
                      borderRadius='20px'>
                      <SimpleGrid minChildWidth='120px' spacing={'40px'} alignItems={'center'}>
                      <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} justifyContent={'center'} backdropFilter='blur(42px)' borderRadius="1em" p='1em' alignItems='center'>
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
              <Button
              variant='no-hover'
              mb={{ sm: "10px", md: "0px" }}
              me={{ md: "12px" }} color='blue.500'
              size='lg'
              onClick={(e) => { openModal(row?.name, e)} } cursor='pointer' bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" justifyContent={'center'} backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
                <Icon as={FaSearchPlus} me='4px' w='16px' h='16px' />
                <Text fontSize='xs' color='gray.400'>Plus de détails</Text>
            </Button>
              {auth?.username === row?.leader_username ?
              <>
              <Button
              variant='no-hover'
              mb={{ sm: "10px", md: "0px" }}
              me={{ md: "12px" }} color='red.500'
              size='lg'
              bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={onDeleteOpen} 
              justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
                <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
                <Text fontSize='xs' color='gray.400'>Supprimer le groupe</Text>
            </Button>
            <Modal
              isCentered
              isOpen={isDeleteOpen} onClose={onDeleteClose}
              motionPreset='slideInBottom'>
              <ModalOverlay />
              <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
                <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Êtes-vous sur de vouloir supprimer le groupe?</center></ModalHeader>
                <ModalCloseButton />
                <ModalBody alignSelf={'center'}>
                <ModalFooter>
                  <Button colorScheme='red' mr={3} onClick={onDeleteClose}>
                    Fermer
                  </Button>
                  <Button colorScheme="blue" name="delete" value={row.group_id} onClick={confirmDelete} variant='ghost'>Oui</Button>
                </ModalFooter>
                </ModalBody>
              </ModalContent>
            </Modal>
            </>
            : !row?.playerJoined ?            
            <Button bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" isDisabled={joining} cursor={joining?'not-allowed':'pointer'} maxWidth={'250px'} justifyContent={'center'} onClick={ () => joinGroup(row?.group_id)} borderRadius="1em" backdropFilter='blur(42px)' size="lg" p='1em' alignItems='center' color='green.500' variant='no-hover'>
                 <Icon as={FaPencilAlt} me='4px' w='14px' h='14px' />
                 <Text fontSize='xs' color='gray.400'>
                   Rejoindre
                 </Text>
             </Button> :
             <>
             <Button
             p='0px'
             variant='no-hover'
             mb={{ sm: "10px", md: "0px" }}
             me={{ md: "12px" }} color='red.500'
             bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth={'250px'} onClick={() => gonnaLeave(row?.group_id, row?.name)} justifyContent={'center'} cursor='pointer' borderRadius="1em" backdropFilter='blur(42px)' marginLeft=".2em" alignItems='center'>
               <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
               <Text fontSize='xs' color='gray.400'>Quitter le groupe</Text>
           </Button>
           <Modal
             isCentered
             isOpen={isLeaveOpen} onClose={onLeaveClose}
             motionPreset='slideInBottom'
           >
             <ModalOverlay />
             <ModalContent bg='linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 99.41%, rgba(10, 14, 35, 0.69) 99%)' alignSelf={'center'} marginRight=".5em" marginLeft=".5em">
               <ModalHeader alignSelf={'center'} color="whiteAlpha.800"><center>Êtes-vous sur de vouloir quitter le groupe? {groupmodalleave?.name}</center></ModalHeader>
               <ModalCloseButton />
               <ModalBody alignSelf={'center'}>
               <ModalFooter>
                 <Button colorScheme='red' mr={3} onClick={onLeaveClose}>
                   Fermer
                 </Button>
                 <Button colorScheme="blue" name="leave" onClick={(e) => confirmLeave(e, groupmodalleave?.id)} variant='ghost'>Oui</Button>
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
      </Card>
      </Flex>
  );
  
} 

export default FindGroup;
