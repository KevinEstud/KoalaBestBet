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
// Chakra imports
import { Alert, AlertIcon, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Button,Checkbox, Flex,Image, Link, Grid, Icon, Spacer, Table, Thead, Tbody, Tr, Td, Th, Text, IconButton,Input,InputGroup,InputRightElement,Select, Stack, Img} from "@chakra-ui/react";

import useAxiosPrivate from "hooks/useAxiosPrivate";
import { RepeatIcon } from '@chakra-ui/icons'
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import useAuth from "hooks/useAuth";
import './Try.css';
import { FaTv } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom";
import useTchat from "hooks/useTchat";
const lastItem = 'no';
function GroupDetails() {
    const { id } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const [refreshpage, setRefreshPage] = useState(false);
    const {socket} = useTchat()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groupranking, setGroupRanking] = useState([]);
    const [error, setError] = useState(false);
    const usersPerPage = 10;
    const pageCount  = (element) => Math.ceil(element / usersPerPage); 
    const [pageNumber2, setPageNumber2] = useState(0);
    
    const pagesVisited2 = pageNumber2 * usersPerPage;
    const changePage2 = ({ selected }) => {
      setPageNumber2(selected);
    };
    const onClickRefresh = async () =>{ 
      setRefreshPage(true);
      if(!isNaN(id)) {
        await getRankingGroup(id)
      }
        return setTimeout(() => setRefreshPage(false), 1500)
    } ;
    const controller = new AbortController();
   async function getRankingGroup (value) {
      if(value !== "" && !isNaN(value)) {
        setLoading(true)
       return await axiosPrivate.get(`/list/rank/group/details/${value}`, {signal: controller.signal}).then((res => {
        if(res?.status===200){
          setError(res?.data?.error)
          setLoading(false)
        } else {
          setGroupRanking(res.data) ;
          setLoading(false);
        }
          })).catch((e) => {
            if(socket) {
              socket.disconnect()
            }
            return navigate('/auth/signin', { state: { from: location }, replace: true });
          })  
          } else {
        setError('Veuillez vérifier le groupe recherché !');
      }
    }
    async function updatePoints () {
      await axiosPrivate.get(`/update-points/group/${id}`, {signal: controller.signal}).then(response => {
        if (response?.status===200){
            setError(response?.data?.error)
            setLoading(false)
        }
        if (response?.status===201){
          getRankingGroup(id);  
          setLoading(false);
    }}
    ).catch((e) => {
      if(socket) {
        socket.disconnect()
      }
      return navigate('/auth/signin', { state: { from: location }, replace: true });
    })  
    }
    async function requestVerifyBet () {

      await axiosPrivate.patch(`/verify-bet/group/${id}`, {signal: controller.signal})
      .then(response =>{
          if (response?.status===200){
              setError(response.data.error)
              setLoading(false)
          }
          else if (response?.status===201){
              updatePoints();
          }
      }).catch((e) => {
        if(socket) {
          socket.disconnect()
        }
        return navigate('/auth/signin', { state: { from: location }, replace: true });
      })  
      }
    
      useEffect(() => {
        document.title = "KoalaBestBet - Détails du Groupe"
        let isMounted = true; 
        if(isMounted && !isNaN(id)) {
          getRankingGroup(id) ;
          if(groupranking && groupranking[0]?.matchFinished?.length > 0) {
          requestVerifyBet();
          }
          } else {
          return navigate('/main/my-groups')
          }
        return () => {
          isMounted = false;
          controller.abort();
        }
        }, [groupranking[0]?.matchFinished?.length])
 return (

  <Flex direction='column' mx='auto'>
      {loading === true &&
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
          }
            {loading === false && groupranking?.length > 0 &&
            groupranking.map((e) => {
             return ( 
          <Card overflowX={{ xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
          <CardHeader p='6px 0px 22px 0px'>
            <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
             Groupe : {e.playerRank[0].name}
           </Text>
          </CardHeader>
          </Card>
             );
            })
            }
      <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='warning' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />A noter que les matchs seront vérifié et les KoalaCoins distribués lorsque tout les matchs d'un groupe seront finis.</Alert>
                  </Card>
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
                  <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />Vous pouvez copier le code d'invitation dans le presse-papier en cliquant simplement dessus.</Alert>
                  </Card>
                  {error &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
                  <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
                  }
      <Flex direction='column'>
      
      {!error && groupranking &&
      <Card textAlign="center" p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ xl: "hidden" }}>
        <Text color='#fff'>Code d'invitation :<button onClick={() => navigator.clipboard.writeText(groupranking[0]?.invitationLink)}><Text fontSize="xs" fontStyle="italic" border=".1em solid black" borderRadius=".4em" marginLeft=".4em">{groupranking[0]?.invitationLink}</Text></button></Text>
        {!refreshpage &&
        <RepeatIcon  onClick={onClickRefresh} style={{ position: 'absolute', right: '4em', color: 'white', cursor:'pointer' }} h={6} w={6}/>
        }
        {refreshpage&&
        <RepeatIcon style={{ position: 'absolute', right: '4em', color: 'gray'}} h={6} w={6}/>
        }
        </Card>
      }
      {groupranking?.length > 0 && groupranking?.map((element) => 
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        
      {element.playerRank &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Classement du groupe
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.playerRank.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Position
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Pseudo
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Paris Gagnant
                </Th>
                {element.playerRank[0].winned_points !== null &&
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Points gagnés
                </Th>
                }
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Grade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {element.playerRank.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              border={lastItem ? "none" : null} textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.position}
                  </Text>
                </Flex>
                </Td>
                <Td
                minWidth={{ sm: "250px" }}
                ps='0px'
                borderBottomColor='#56577A'
                border={lastItem ? "none" : null} textAlign='center'>
                <Flex fontStyle={'italic'} align='center' justifyContent={'center'} flexDir={'row'} py='.8rem' minWidth='100%'>
                  <Image
                  borderRadius='full'
                  boxSize='24px'
                  src={require('images/avatar/'+row.avatar_path)}
                  alt='Profile Picture'
                    />&ensp;{row.username}
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.winning_bet}
              </Text>
            </Td>
            {row.winned_points !== null &&
            <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.winned_points}
              </Text>
            </Td>
              }
                   <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center' >
                   <Flex direction='column'>
             
                   <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                    {row.grade}
                    </Text>
             
                   </Flex>
                   </Td>
                   </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.betFromUser &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Rappel de vos pronostics
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.betFromUser.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Gagnant pronostiqué
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {element.betFromUser.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                  border={lastItem ? "none" : null} textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.name}
                  </Text>
                </Flex>
                </Td>
                <Td
                minWidth={{ sm: "250px" }}
                ps='0px'
                borderBottomColor='#56577A'
                border={lastItem ? "none" : null} textAlign='center'>
                <Flex fontStyle={'bold'} align='center' justifyContent={'center'} flexDir={'row'} py='.8rem' minWidth='100%'>
                  <Image
                  borderRadius='full'
                  boxSize={"24px"}
                  src={row.team_logo}
                  alt={row.winner_bet}
                    />&ensp;{row.winner_bet}
                </Flex>
              </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.matchLive && element.matchLive.length > 0 &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
          Matchs En Direct
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.matchLive.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Scores
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Live
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {element.matchLive.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_name}
                  </Text>
                </Flex>
                </Td>
                <Td borderBottomColor='#56577A' textAlign='center'>
        <Flex direction='column'>
          
          <Text
            fontSize='sm'
            color='#fff'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'}>
            <Image borderRadius='full' boxSize='24px' src={row.team1_logo} alt={`${row.team1_name} logo`} />
            {row.team1_name}
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {row.team1_score}
            </Text> vs
            
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {row.team2_score}
            </Text> {row.team2_name}<Image borderRadius='full' boxSize='24px' src={row.team2_logo} alt={`${row.team2_name} logo`} />
            </Text>
          
            </Flex>
            </Td>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                    <Link onClick={() => {
                      window.open(row.live_official, '_blank')
                    }} fontSize={'sm'}> Voir le match</Link>
                </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.matchIncoming && element.matchIncoming.length > 0 &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
          Matchs A venir
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.matchIncoming.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Heure du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Equipes
                </Th>
                </Tr>
            </Thead>
            <Tbody>
            {element.matchIncoming.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_begin_at}
                  </Text>
                </Flex>
                </Td>
                <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_name}
                  </Text>
                </Flex>
                </Td>
                <Td borderBottomColor='#56577A' textAlign='center'>
                <Flex direction='column'>
    
                  <Text
                  fontSize='sm'
                color='#fff'
                fontWeight='bold'
                pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
                  <Image borderRadius='full' boxSize='24px' src={row.team1_logo} alt={`${row.team1_name} logo`} />{row.team1_name} vs {row.team2_name}<Image borderRadius='full' boxSize='24px' src={row.team2_logo} alt={`${row.team2_name} logo`} />
                </Text>
    
          </Flex>
            </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.matchFinished && element.matchFinished.length > 0 &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
          Matchs Terminés
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.matchFinished.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Score
                </Th>
                </Tr>
            </Thead>
            <Tbody>
            {element.matchFinished.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_name}
                  </Text>
                </Flex>
                </Td>
                <Td borderBottomColor='#56577A' textAlign='center'>
        <Flex direction='column'>
          
          <Text
            fontSize='sm'
            color='#fff'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'}>
            <Image borderRadius='full' boxSize='24px' src={row.team1_logo} alt={`${row.team1_name} logo`} />
            {row.team1_name}
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {row.team1_score}
            </Text> vs
            
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {row.team2_score}
            </Text> {row.team2_name}<Image borderRadius='full' boxSize='24px' src={row.team2_logo} alt={`${row.team2_name} logo`} />
            </Text>
          
            </Flex>
            </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.matchPostponed && element.matchPostponed.length > 0 &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
          Matchs Reportés
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.matchPostponed.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du Match
                </Th>
                </Tr>
            </Thead>
            <Tbody>
            {element.matchPostponed.map((row) => {
              return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_name}
                  </Text>
                </Flex>
                </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
        {element.matchCanceled && element.matchCanceled.length > 0 &&
      <Accordion defaultIndex={0} allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center'  m=".4em" marginBottom=".8em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
          Matchs Annulés
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.matchCanceled.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign='center'>
                  Nom du Match
                </Th>
                </Tr>
            </Thead>
            <Tbody>
            {element.matchCanceled.map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                   textAlign='center'>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_name}
                  </Text>
                </Flex>
                </Td>
            </Tr>
                );
              })}
              
            </Tbody>
          </Table>
        </Card>
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        }
     </Card>
     
)}
     </Flex>

    </Flex>
  );
}

export default GroupDetails;
