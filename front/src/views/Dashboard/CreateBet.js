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
  Flex,
  Table,
  Tbody,
  Text,
  Td,
  Tr,
  Image,
  Button,
} from "@chakra-ui/react";
// Custom components
import useAuth from "hooks/useAuth";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import {useParams, useNavigate, useLocation} from "react-router-dom"; 
import useTchat from "hooks/useTchat";
import useAxiosPrivate from "hooks/useAxiosPrivate";
function CreateBet() {
  const axiosPrivate = useAxiosPrivate();
  const { id } = useParams();
  const [checkboxed, setCheckboxed] = useState([]);
  const [selected, setSelected] = useState(false);
  const navigate = useNavigate();
  const location  = useLocation();
  const {socket} = useTchat()
  const [dataGroup,setDataGroup] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const Checkboxed = ((e) => {
    let selectedMatches = [...checkboxed];
        if(selectedMatches.length > 0) {
          let newArray = selectedMatches.filter(el => el.id !== e.id)
          newArray.push({
            'id' : e.id,
            'selected': e.selected
                })
            setCheckboxed(newArray)
           } else {
            selectedMatches.push({
              'id' : e.id,
              'selected': e.selected
                  });
            setCheckboxed(selectedMatches)
          }
          });
  const onSubmit = async (e) => {
    e.preventDefault();
    if(dataGroup.length === checkboxed.length) {
     await axiosPrivate.put(`/create-bet/group/${id}`, {bets: checkboxed}).then(res => {
        if(res?.status === 201) {
          setError(false)
          setSuccess('Vos Pronostics ont bien été enregistré !, Vous allez être redirigé vers la page de rappel des paris...')
          return setTimeout(() => {
            navigate(`/main/group/${id}`), 2500});
        }else {
          setSuccess(false)
          setError(res?.data.error)
        }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    } else {
      setSuccess(false)
      setError('Veuillez vérifier le nombre d\'équipe sélectionné.')
    }
  }

  useEffect(async () => {
    document.title = "KoalaBestBet - Créer mon pronostic"
    if(!id || isNaN(id)) {
      return navigate('/main/groups')
    }
    let isMounted = true; 
    const controller = new AbortController();
    setLoading(true);
    if(isMounted) {
      await axiosPrivate.get(`/list/matchs/group/${id}`, {signal: controller.signal}).then(res => {
        if(res?.status === 201 && isMounted) {
          setDataGroup(res?.data);
        } 
        else if(res?.data?.error === "Vous avez déjà parié dans ce groupe.") {
          setError(res?.data?.error)
          return setTimeout(() => {
            navigate(`/main/group/${id}`), 3500});
        }
        else {
          setError(res?.data?.error)
        }
        setLoading(false);
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
    }
    return () => {
      isMounted = false;
      controller.abort();
    }
  },[]);
  return (
    
    <Flex direction='column' mx='auto'>
      {/* Mes Groupes */}
      <Card overflowX={{ xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Créer mes pronostics
          </Text>
        </CardHeader>
      </Card>
      <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />Pour pouvoir pronostiquer, veuillez sélectionner les équipes qui seront gagnante selon vous, puis patientez jusqu'à la fin de tout les matchs afin de connaitre les résultats.</Alert>
                  </Card>
                  {success &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{success}</Alert>
                  </Card>
        }
      {error &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
        {dataGroup?.map((row, index, arr) => {
        return (
      <Card my={{ lg: ".2em" }} me={{ lg: "24px" }}  marginTop=".2em">
          <Flex direction='column'>
            <CardBody>
              <Flex direction='column' w='100%'>
              <Card paddingRight="16px" paddingBottom="16px" paddingLeft="16px" paddingTop="0" marginTop=".2em" marginBottom=".4em" overflowX={{ sm: "scroll", xl: "hidden" }} alignItems={'center'}>
                <Flex style={{backgroundColor: 'black', paddingLeft: '.8em', paddingRight:'.8em', paddingTop:'.4em', paddingBottom: '.8em', marginBottom: '.6em'}} borderBottomRadius="25%" flexDirection="column" marginLeft="auto" marginRight="auto" marginTop="0" alignItems={'center'}>
                <Text fontSize='xs' color='gray.100'>{row.video_game}</Text>
                <Text fontSize='xs' fontStyle={'italic'} color='gray.400'><center>{row.league}</center></Text>
                <Text fontSize='xs' color='gray.300'><center>{row.match_name}</center></Text>
                <Text fontSize='xs' color='gray.500'>BO{row.number_of_games}</Text>
                <Text fontSize='xs'color='gray.500'>{row.match_begin_at}</Text>
                </Flex>
                <Flex flexDirection={'row'}>
                <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        {/* Projects */}
        <Card p='16px' m='.2em' overflowX={{ xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='unstyled' color='#fff'>
            <Tbody border="0">
            
                  <Tr>
                  {checkboxed.some(e => e.selected === row.team1_id && e.id === row.matchos_id) ?
                   <Td key={row.team1_id}
                   value={row.team1_id} borderBottomColor='#56577A' textAlign='center' borderRadius={'9%'}  backgroundColor={'gray.900'} onClick={(e) => {setSelected(false); Checkboxed({id: row.matchos_id, unselected: row.team1_id})}}  style={{cursor: 'pointer'}}>
                   <Flex direction='column'>
                   <Text
                  fontSize='sm'
                    color='#fff'
                    fontWeight='bold' key={row.team1_id}
                    value={row.team1_id}
                    pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                        {row.team1_name}&nbsp; <Image borderRadius='full' boxSize='24px' src={row.team1_logo} alt={`${row.team1_name} logo`} />
                     </Text>
             
                   </Flex>
                   </Td> :
                   <Td key={row.team1_id}
                   value={row.team1_id} borderBottomColor='#56577A' textAlign='center' style={{cursor: 'pointer'}} onClick={(e) => {setSelected(true); Checkboxed({id: row.matchos_id, selected: row.team1_id})}} >
                   <Flex direction='column'>
                   <Text
                  fontSize='sm'
                    color='#fff'
                    key={row.team1_id}
                    value={row.team1_id}
                    fontWeight='bold'
                    pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                        {row.team1_name}&nbsp;<Image borderRadius='full' boxSize='24px' src={row.team1_logo} alt={`${row.team1_name} logo`} />
                     </Text>
             
                   </Flex>
                   </Td>
                   
                  }
                   <Td borderBottomColor='#56577A' textAlign='center' >
                   <Flex direction='column'>
                   <Text
                  fontSize='sm'
                    color='#fff'
                    fontWeight='bold'
                    pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                    vs
                     </Text>
             
                   </Flex>
                   </Td>
                   {checkboxed.some(e => e.selected === row.team2_id && e.id === row.matchos_id) ?
                   <Td key={row.team2_id} value={row.team2_id} borderBottomColor='#56577A' textAlign='center' borderRadius={'9%'}  backgroundColor={'gray.900'} onClick={(e) => {setSelected(false);Checkboxed({id: row.matchos_id, unselected: row.team2_id})}}  style={{cursor: 'pointer'}}>
                   <Flex direction='column'>
                   <Text
                  fontSize='sm'
                    color='#fff'
                    key={row.team2_id}
                    value={row.team2_id}
                    fontWeight='bold'
                    pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                        {row.team2_name}&nbsp;<Image borderRadius='full' boxSize='24px' src={row.team2_logo} alt={`${row.team2_name} logo`} />
                     </Text>
             
                   </Flex>
                   </Td> :
                   <Td borderBottomColor='#56577A' textAlign='center' style={{cursor: 'pointer'}} onClick={() => {setSelected(true); Checkboxed({id: row.matchos_id, selected: row.team2_id})}}>
                   <Flex direction='column'>
                   <Text
                  fontSize='sm'
                    color='#fff'
                    fontWeight='bold'
                    key={row.team2_id}
                    value={row.team2_id}
                    pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                        {row.team2_name}&nbsp;<Image borderRadius='full' boxSize='24px' src={row.team2_logo} alt={`${row.team2_name} logo`} />
                     </Text>
             
                   </Flex>
                   </Td>
                   
                  }
                  
                  </Tr>
            </Tbody>
          </Table>
        </Card>
      </Box>
                </Flex>
                </Card>
              </Flex>
            </CardBody>
          </Flex>
        </Card>
          )
        }
        )}
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} m='.2em'>
        <Button onClick={onSubmit}>Valider mes pronostics</Button>
        </Card>
          </Flex>
  );
}

export default CreateBet;
