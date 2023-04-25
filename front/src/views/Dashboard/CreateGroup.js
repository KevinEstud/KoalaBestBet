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
import useAuth from 'hooks/useAuth';
import useTchat from "hooks/useTchat"
import ReactPaginate from "react-paginate";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import { Alert, AlertIcon, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Button,Checkbox, Flex, Grid, Icon, Spacer, Table, Thead, Tbody, Tr, Td, Th, Text, Tooltip, Input, Image, Select, Stack} from "@chakra-ui/react";
import { QuestionOutlineIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import { useNavigate, useLocation } from "react-router-dom";
const lastItem = 'no';
function CreateGroup() {
    const axiosPrivate = useAxiosPrivate();
    const { setAuth, auth}  = useAuth();
    const { socket } = useTchat();
    const location  = useLocation();
    const navigate = useNavigate();
    const [newleader, setNewLeader] = useState(false);
    const [groupInfos, setGroupInfos] = useState({
      name: "",
      nbJoueurs: ""
    })
    const [groupmatchs, setGroupMatchs] = useState()
    const [isprivate, setIsPrivate] = useState(true);
    const [loading, setLoading] = useState(false);
    const [checkboxed, setCheckboxed] = useState([]);
    const [invitation, setInvitation]= useState('');
    const [error, setError]= useState();
    const onSubmit = async (e) =>{
      e.preventDefault();
      if(checkboxed.length === 0) {
        setError('Veuillez sélectionner un match au minimum')
      } 
      if(checkboxed.length > 0 && isprivate) {
        await axiosPrivate.put('/create-group', {name: groupInfos.name,nbJoueurs: groupInfos.nbJoueurs, matchs_id: checkboxed, isprivate})
        .then(res => {
          if(res?.status === 201) {
            setNewLeader(true);
            setAuth(prev => {
              return {
                  ...prev,
                  isLeading: true
              }
          })
          setInvitation(res.data.invitation_link) 
        } 
        if(res?.status === 200) {
          setError(res.data.error)
        }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
      }
      if(checkboxed.length > 0 && !isprivate && groupmatchs) {
        await axiosPrivate.put('/create-group', {name: groupInfos.name,nbJoueurs: groupInfos.nbJoueurs, matchs_id: checkboxed, isprivate,  groupmatchs: groupmatchs})
        .then(res => {
          if(res?.status === 201) {
            setNewLeader(true);
            setAuth(prev => {
              return {
                  ...prev,
                  isLeading: true
              }
          })
          socket.emit("new_group", { name: groupInfos.name})
          setError(false)
          setInvitation(res.data.invitation_link) 
        } 
        if(res?.status === 200) {
          setError(res.data.error)
        }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
      }
    
    }
    const [pageNumber2, setPageNumber2] = useState(0);
    const [pageNumber4, setPageNumber4] = useState(0);
    const [pageNumber6, setPageNumber6] = useState(0);
    const [dataMatch, setDataMatch] = useState([]);
    const pageCount  = (element) => Math.ceil(element / usersPerPage);
    const usersPerPage = 5;
    const pagesVisited2 = pageNumber2 * usersPerPage;
    const pagesVisited4 = pageNumber4 * usersPerPage;
    const pagesVisited6 = pageNumber6 * usersPerPage;
    const changePage2 = ({ selected }) => {
      setPageNumber2(selected);
    };
    const changePage4 = ({ selected }) => {
      setPageNumber4(selected);
    };
    const changePage6 = ({ selected }) => {
      setPageNumber6(selected);
    };
    const onChange = (e) => {
      setGroupInfos({ ...groupInfos, [e.target.name]: e.target.value });
    };
    const Checkboxed = ((e) => {
      e.preventDefault();
      let selectedMatches = [...checkboxed];
      if(e.target.checked && checkboxed.length < 5) {
        selectedMatches.push(parseInt(e.target.value));
        setGroupMatchs(prev => ({...prev, [e.target.name]: e.target.getAttribute('aria-label') }) )
        setCheckboxed(selectedMatches)
        }
      if (!e.target.checked) {
        const valuee = parseInt(e.target.value) ;
        setCheckboxed(selectedMatches.filter(e => e !== valuee))
        setGroupMatchs(Object.fromEntries(Object.entries(groupmatchs).filter(([key])=>!e.target.name.includes(key))))
      }
      if(checkboxed.length >= 5) {
        setError('Vous pouvez séléctionner maximum 5 Matchs')
       }
      
    });

    useEffect(async () => {
      document.title = "KoalaBestBet - Créer un groupe"
      let isMounted = true; 
      const controller = new AbortController();
      if(isMounted) {
        setLoading(true)
        await axiosPrivate.get('/list/matchs/upcoming', {signal: controller.signal}).then((res) => {
         if(res.status === 201 && isMounted) {
           setDataMatch(res.data)
           setLoading(false)
          } else {
            setError(res?.data?.error)
            setLoading(false)
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
        controller.abort();
      }
  }, []);
  return (
    <Flex direction='column' mx='auto'>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Créer un groupe
          </Text>
        </CardHeader>
      </Card>
      <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />Afin de pouvoir créer un groupe, veuillez tout d'abord saisir un nom de groupe, 
                  le nombre de joueurs qui sera présent dans votre groupe (allant de 2 à 5), 
                  et enfin sélectionnez les matchs (allant de 1 à 5 matchs tout sports confondus) sur lesquels vous souhaitez vous et vos amis pronostiquer.</Alert>
                  </Card>
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='warning' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />A noter que un seul groupe peut-être crée à la fois par une personne, pour cela vous aurez juste à quitter le groupe dont vous êtes leader lorsque vos KoalaCoins
                  seront distribués afin de pouvoir en créer un nouveau, en revanche vous pouvez rejoindre autant de groupe que vous souhaitez.</Alert>
                  </Card>
                  {invitation !== '' &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='success' borderRadius='12px' m='.2em' flexDirection="column" justifyContent="center">
                  <AlertIcon />Votre groupe a bien été crée, partagez ce code d'invitation à vos amis, et commencez à pronostiquer ! 
                  Votre code : {invitation}
                  <button onClick={() => navigator.clipboard.writeText(invitation)}><Text fontSize="xs" fontStyle="italic" border=".1em solid black" borderRadius=".4em" marginLeft=".4em"> Cliquez ici pour copier votre code.</Text></button></Alert>
                  </Card>
                  }
                  {error &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
        {auth?.isLeading === true & newleader === false ?
        <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
        <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                    <AlertIcon />Vous avez déjà crée un groupe, veuillez le supprimer afin de pouvoir en créer un nouveau.</Alert>
                    </Card>
        : newleader === false &&
      <Card p='16px' marginTop=".2em" marginBottom=".2em">
      <form className="createGroup-form" onSubmit={onSubmit}>
      <Card p='16px' marginTop=".2em" marginBottom=".2em">
                <Flex direction='row' justifyContent='space-around' >
                <Input                
                id="name"
                style={{color:'white'}}
                placeholder="Nom du groupe"
                required 
                helperText="Aucun espace n'est accepté dans le nom du groupe"  
                name="name"             
                value={groupInfos.name}
                onChange={onChange}   maxWidth='40%' focusBorderColor='#A0AEC0'/>
              <Select placeholder='Nombre de joueurs' 
              required
              bg='white'
              name="nbJoueurs"
              value={groupInfos.nbJoueurs}
              onChange={onChange} maxWidth='40%' justifyItems={'center'} focusBorderColor='#A0AEC0'>
                    <option
                    value={2}>2</option>
                    <option
                    value={3}>3</option>
                    <option
                    value={4}>4</option>
                    <option
                    value={5}>5</option>
              </Select>
              </Flex>
              </Card>
              {/* Table */}
    <Flex flexDirection='column' pt={{ md: "0" }}>
      {loading === true &&
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
      }
      {loading === false && dataMatch.map((element) => 
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <Accordion allowToggle>
        
      {element.infosOfMatchCSGO &&
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".4em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Counter-Strike Global Offensive ({element.infosOfMatchCSGO.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.infosOfMatchCSGO.length > 0 &&
      <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        {/* Projects */}
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
              <Th 
                  borderBottomColor='#56577A' textAlign={'center'}>
                    {" "} 
              </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Heure du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Nom Du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Equipes
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {element.infosOfMatchCSGO.slice(pagesVisited2, pagesVisited2 + usersPerPage).map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              border={lastItem ? "none" : null} textAlign='center'>
              <Checkbox key={row.match_name} name={row?.match_name} value={row.id} isChecked={checkboxed.includes(row.id)} onChange={(e) =>  {Checkboxed(e)}} id={row.id} aria-label={row?.match_begin_at} />
                </Td>
                
                <Td
                minWidth={{ sm: "250px" }}
                ps='0px'
                borderBottomColor='#56577A'
                border={lastItem ? "none" : null} textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_begin_at}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.match_name}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center' >
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
                  // <DashboardTableRow
                  // matchName={row.match_name}
                  //   matchId={row.id}
                  //   checkbox={true}
                  //   begin_at={row.match_begin_at}
                  //   team1name={row.team1_name}
                  //   team1logo={row.team1_logo}
                  //   team2name={row.team2_name}
                  //   team2logo={row.team2_logo}
                  //   lastItem={index === arr.length - 1 ? true : false}
                  // />
                );
              })}
            </Tbody>
          </Table>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
          {element.infosOfMatchCSGO.length > usersPerPage &&
          <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
        pageCount={pageCount(element.infosOfMatchCSGO.length??null)}
        onPageChange={changePage2}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
         }
         </Card>
        </Card>
        {/* Orders Overview */}
      </Box>
        }
        </AccordionPanel>
        </AccordionItem>
        }
        {element.infosOfMatchValorant &&
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".4em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Valorant ({element.infosOfMatchValorant.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.infosOfMatchValorant.length > 0 &&
      <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        {/* Projects */}
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
              <Th 
                  borderBottomColor='#56577A' textAlign={'center'}>
                    {" "}
              </Th>
                <Th
                  
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Heure du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Nom du Match
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Equipes
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {element.infosOfMatchValorant.slice(pagesVisited4, pagesVisited4 + usersPerPage).map((row, index, arr) => {
                return (
                  <Tr>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              border={lastItem ? "none" : null} textAlign='center'>
              <Checkbox key={row.match_name} name={row?.match_name} value={row.id} isChecked={checkboxed.includes(row.id)} onChange={(e) =>  {Checkboxed(e)}} id={row.id} aria-label={row?.match_begin_at} />
                </Td>
                
                <Td
                minWidth={{ sm: "250px" }}
                ps='0px'
                borderBottomColor='#56577A'
                border={lastItem ? "none" : null} textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_begin_at}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.match_name}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center' >
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
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
          {element.infosOfMatchValorant.length > usersPerPage &&
          <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
        pageCount={pageCount(element.infosOfMatchValorant.length??null)}
        onPageChange={changePage4}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
         }
         </Card>
        </Card>
        {/* Orders Overview */}
      </Box>
    }
    </AccordionPanel>
    </AccordionItem>
      }
      {element.infosOfMatchLOL &&
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".4em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           League Of Legends ({element.infosOfMatchLOL.length})
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        {element.infosOfMatchLOL.length > 0 &&
      <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        {/* Projects */}
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='simple' color='#fff'>
            <Thead>
            <Tr my='.8rem' ps='0px'>
              <Th
                  borderBottomColor='#56577A' textAlign='center'>
                    {" "}
              </Th>
                <Th
                  ps='0px'
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
            {element.infosOfMatchLOL.slice(pagesVisited6, pagesVisited6 + usersPerPage).map((row, index, arr) => {
              
                return (
                  <Tr>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              border={lastItem ? "none" : null} textAlign='center'>
              <Checkbox key={row.match_name} name={row?.match_name} value={row.id} isChecked={checkboxed.includes(row.id)} onChange={(e) =>  {Checkboxed(e)}} id={row.id} aria-label={row?.match_begin_at} />
                </Td>
                
                <Td
                minWidth={{ sm: "250px" }}
                ps='0px'
                borderBottomColor='#56577A'
                border={lastItem ? "none" : null} textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.match_begin_at}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.match_name}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center' >
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
          {element.infosOfMatchLOL.length > usersPerPage &&
          <Card overflowX={{ sm: "scroll", xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
          <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
        pageCount={pageCount(element.infosOfMatchLOL.length??null)}
        onPageChange={changePage6}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
         </Card>
         }
        </Card>
        {/* Orders Overview */}
      </Box>
    }
    </AccordionPanel>
    </AccordionItem>
      }
     
      </Accordion>
     </Card>
)}

      </Flex>
      <Card overflowX={{ xl: "hidden" }} m='.2em'>
      <Stack spacing={5} direction='row' alignSelf={'center'} alignItems={'center'}>
      <Tooltip hasArrow label="En mettant votre groupe en status privé, il sera possible de le rejoindre que par lien d'invitation">
      <QuestionOutlineIcon boxSize="20px" color='white' />
      </Tooltip><Checkbox onChange={() => setIsPrivate(prev => !prev)} isChecked={isprivate} defaultChecked color='white'>Privé</Checkbox>
      <Checkbox onChange={() => setIsPrivate(prev => !prev)} isChecked={!isprivate} color='white'>Public</Checkbox>
      <Tooltip hasArrow label="En mettant votre groupe en status public, il sera possible de le rejoindre via la page 'Trouver un groupe', ainsi que par lien d'invation ">
      <QuestionOutlineIcon boxSize="20px" color='white' />
      </Tooltip>
      </Stack>
      </Card>
    <Card overflowX={{ xl: "hidden" }} m='.2em'>
        <Button type='submit'>Créer mon groupe</Button>
      </Card>

            </form>
      </Card>
}
    </Flex>
  );
} 

export default CreateGroup;
