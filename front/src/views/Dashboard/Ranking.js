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
import ReactPaginate from "react-paginate";
// Chakra imports
import { Alert, AlertIcon, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Flex, Table, Thead, Tbody, Tr, Td, Th, Text, IconButton,Input,InputGroup,InputRightElement,Select} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";

// Icons
import { SearchIcon } from "@chakra-ui/icons";
import useAxiosPrivate  from "hooks/useAxiosPrivate";
import useTchat from "hooks/useTchat";
function Ranking() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(false);
    const { socket} = useTchat()
    const [grouptocheck, setGroupToCheck] = useState("");
    const [groupInfos, setGroupInfos] = useState([]);
    const [groupranking, setGroupRanking] = useState([]);
    const [rankingfiltered, setRankingFiltered] = useState([]);
    const [searchvalue, setSearchValue] = useState(""); 
    const [valuefiltered, setValueFiltered] = useState(false??true);
    const location  = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState();
    const axiosPrivate = useAxiosPrivate();
    const usersPerPage = 10;
    const pageCount  = (element) => Math.ceil(element / usersPerPage); 
    const [pageNumber2, setPageNumber2] = useState(0);
    
    const pagesVisited2 = pageNumber2 * usersPerPage;
    const changePage2 = ({ selected }) => {
      setPageNumber2(selected);
    };
    let isMounted = true;
    const controller = new AbortController();
   async function getRankingGroup (value) {
      if(!isNaN(value)) {
       return await axiosPrivate.get(`/list/rank/group/${value}`, {signal: controller.signal}).then((res => {
         if(res?.status === 201 && isMounted) {
            setError(false)
            setGroupRanking(res.data) ;
          } else {
            setGroupRanking();
            setError(res?.data.error)
          }
         })).catch((e) => {
          if(socket) {
            socket.disconnect()
           }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
        } else if (value !== "") {
          setError(false)
        }else {
        setError('Veuillez vérifier le groupe recherché !');
      } 
    }
    
    function getFilter (value) {
      const filtered = ranking.filter((el) => {
        if(value == ""  && !valuefiltered || value.length <= 1 && !valuefiltered) {
          return el;
        } else if(value == ""  && valuefiltered || value.length <= 1 && valuefiltered) {
          return el;
        }
        else if (el.username.toLowerCase().includes(value.toLowerCase()) && value.length >= 2){
          return el ;
        }
        else if (el.grade.toLowerCase().includes(value.toLowerCase()) && value.length >= 2){
          return el ;
        }
      }); 
      if(value == ""  && !valuefiltered || value.length <= 1 && !valuefiltered) {
        setValueFiltered(false)
      }
      if(value == ""  && valuefiltered || value.length <= 1 && valuefiltered) {
        setPageNumber2(0);
        setValueFiltered(false)
      }
      if (value !== "" || value.length >= 2){
        setPageNumber2(0);
        setRankingFiltered(filtered)
        setValueFiltered(true)
      }
    }
    
    useEffect(async () => {
        document.title = "KoalaBestBet - Page de Classement"
        let isMounted = true
        setLoading(true)
        if(isMounted) {
          await axiosPrivate.get('/list/groups/user', {signal: controller.signal}).then((res) => {
            setGroupInfos(res.data)
          }).catch((e) => {
            if(socket) {
              socket.disconnect()
             }
            return navigate('/auth/signin', { state: { from: location }, replace: true });
          })
          }
          if(isMounted) {
          await axiosPrivate.get('/list/rank', {signal: controller.signal}).then((res) => {
            if(res.status === 201 && isMounted){
              setRanking(res.data)
            } 
          }).catch((e) => {
            if(socket) {
              socket.disconnect()
             }
            return navigate('/auth/signin', { state: { from: location }, replace: true });
          })
        }
        setLoading(false)
        return () => {
          isMounted = false;
          controller.abort();
        }
    }, []);
 return (
  <Flex direction='column' mx='auto'>
          <Card overflowX={{ xl: "hidden" }} pb='0px' marginTop=".2em" marginBottom=".2em">
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='lg' m='auto' color='#fff' fontWeight='bold'>
            Classement
          </Text>
        </CardHeader>
      </Card>
      <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='info' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />La barre de recherche pour le classement général fonctionne sur les pseudos ainsi que les grades.</Alert>
                  </Card>
               {error &&
                  <Card overflowX={{ xl: "hidden" }} marginTop=".2em" marginBottom=".2em" p=".8em">
      <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
                  <AlertIcon />{error}</Alert>
                  </Card>
        }
        {loading === true ?
      <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
        <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
        </Card>
        :
      <Flex direction='column'>
      <Card maxWidth="100%" p='16px' m=".4em">
       <Accordion allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".2em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Classement Par Groupe
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
       <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em' color='gray.500'>
        {/* Projects */}
        {groupInfos && groupInfos.length > 0 ?
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
        <Flex flexDirection='row' alignSelf={'center'}>
        <Select fontSize={'xs'} onChangeCapture={async (e) => {setGroupToCheck(e.target.value), await getRankingGroup(e.target.value)}} style={{ marginBottom: '.8em', color: 'gray.500'}} marginLeft='auto' borderRadius='15px' w='250px' placeholder='Sélectionnez votre groupe'>
          { groupInfos && groupInfos.map((e) => {
            return (
              <>
              <option value={e.group_id}>{e.name}</option>
              </>
            )
          })

          }
          
         </Select>
         </Flex>
         </Card> :
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Text alignSelf='center' color='white' fontSize={'s'}>Vous n'avez rejoins aucun groupe.</Text>
        </Card>
        }
          {grouptocheck !== '' ?
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='simple' color='#fff'>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Position
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Pseudo
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  KoalaCoins Gagnés
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Grade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {groupranking && groupranking?.map((row, index, arr) => {
                return (
                  <Tr>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              textAlign='center'>
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
                 textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.username}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.winned_points??0}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' textAlign='center' >
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
          <Box color='#fff' _hover={{ color: 'gray.500' }} fontSize={'s'} style={{cursor: 'pointer', alignSelf: 'center'}} onClick={() => navigate(`/main/group/${grouptocheck}`)}>
            plus de détails
            </Box>
        </Card> : !grouptocheck && groupInfos?.length > 0 && 
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
            <Text alignSelf='center' color='white' fontSize={'s'}>Veuillez sélectionner un groupe.</Text>
          </Card>
          }
      </Box>
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
        {/* Orders Overview */}
     </Card>
     <Card maxWidth="100%" p='16px' m=".4em">
     <Accordion allowToggle>
      <AccordionItem borderTopWidth='0px'borderBottom='0px'>
      <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".2em">
        <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
           Classement Général
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
       <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
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
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }} bg='linear-gradient(97.89deg, #242740 70.67%, rgba(117, 122, 140, 0) 108.55%)'>
          <Table variant='simple' color='#fff' marginBottom={'.4em'}>
            <Thead>
              <Tr my='.8rem' ps='0px'>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Position
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Pseudo
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  KoalaCoins Gagnés
                </Th>
                <Th
                  color='gray.400'
                  fontFamily='Plus Jakarta Display'
                  borderBottomColor='#56577A' textAlign={'center'}>
                  Grade
                </Th>
              </Tr>
            </Thead>
            <Tbody>
            {rankingfiltered.length > 0 && valuefiltered
            ? 
            rankingfiltered.slice(pagesVisited2, pagesVisited2 + usersPerPage).map((row, index, arr) => {
                return (
                  <Tr key={index}>
                  <Td
        ps='0px'
        borderBottomColor='#56577A'
              textAlign='center'>
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
                textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.username}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A'  textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.koalacoin}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' textAlign='center' >
                   <Flex direction='column'>
             
                   <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.grade}
              </Text>
             
                   </Flex>
                   </Td>
                   </Tr>
                );
              }) : 
              !valuefiltered &&
              ranking.slice(pagesVisited2, pagesVisited2 + usersPerPage).map((row, index, arr) => {
                return (
                  <Tr>
                  <Td
                  ps='0px'
                  borderBottomColor='#56577A'
                  textAlign='center'>
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
                textAlign='center'>
                <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
                  <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
                    {row.username}
                  </Text>
                </Flex>
              </Td>
              <Td borderBottomColor='#56577A' textAlign='center'>
              <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.koalacoin}
              </Text>
            </Td>
                   <Td borderBottomColor='#56577A' textAlign='center' >
                   <Flex direction='column'>
             
                   <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
                {row.grade}
              </Text>
             
                   </Flex>
                   </Td>
                   </Tr>
                );
              })
              }
            </Tbody>
          </Table>
          {rankingfiltered.length > usersPerPage && valuefiltered ?
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(rankingfiltered.length)}
        onPageChange={changePage2}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        /> : 
        ranking.length > usersPerPage && !valuefiltered &&
        <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        pageCount={pageCount(ranking.length)}
        onPageChange={changePage2}
        containerClassName={"paginationBttns"}
        previousLinkClassName={"previousBttn"}
        nextLinkClassName={"nextBttn"}
        disabledClassName={"paginationDisabled"}
        activeClassName={"paginationActive"}
        />
          }
         
        </Card>
      </Box>
        </AccordionPanel>
        </AccordionItem>
        </Accordion>
     </Card>
     </Flex>
    }
    </Flex>
  );
}

export default Ranking;
