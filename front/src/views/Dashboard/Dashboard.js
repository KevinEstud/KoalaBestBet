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
import './Try.css';
import useTchat from "hooks/useTchat";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
// Custom components
import useAuth  from "hooks/useAuth"
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import DashboardTableRow from "components/Tables/DashboardTableRow";
import ReactPaginate from "react-paginate";
export default function Dashboard() {
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageNumber2, setPageNumber2] = useState(0);
  const [pageNumber3, setPageNumber3] = useState(0);
  const [pageNumber4, setPageNumber4] = useState(0);
  const [pageNumber5, setPageNumber5] = useState(0);
  const [pageNumber6, setPageNumber6] = useState(0);
  const { auth } = useAuth();
  const {socket} = useTchat()
  const navigate = useNavigate();
  const location = useLocation();
  const [dataMatch, setDataMatch] = useState([]);
  const usersPerPage = 5;
  const pageCount  = (element) => Math.ceil(element / usersPerPage);
  const pagesVisited = pageNumber * usersPerPage;
  const pagesVisited2 = pageNumber2 * usersPerPage;
  const pagesVisited3 = pageNumber3 * usersPerPage;
  const pagesVisited4 = pageNumber4 * usersPerPage;
  const pagesVisited5 = pageNumber5 * usersPerPage;
  const pagesVisited6 = pageNumber6 * usersPerPage;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  const changePage2 = ({ selected }) => {
    setPageNumber2(selected);
  };
  const changePage3 = ({ selected }) => {
    setPageNumber3(selected);
  };
  const changePage4 = ({ selected }) => {
    setPageNumber4(selected);
  };
  const changePage5 = ({ selected }) => {
    setPageNumber5(selected);
  };
  const changePage6 = ({ selected }) => {
    setPageNumber6(selected);
  };
  useEffect(async () => {
    document.title = "KoalaBestBet - Accueil"
      let isMounted = true; 
      const controller = new AbortController();
      setLoading(true);
      if(isMounted) {
        await axiosPrivate.get('/list/matchs', {signal: controller.signal}).then((res) => {
          if(res.status === 201 && isMounted) {
            setDataMatch(res.data)
          }
        }).catch((e) => {
          if(socket) {
            socket.disconnect()
          }
          return navigate('/auth/signin', { state: { from: location }, replace: true });
        })  
        setLoading(false)
      }
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
              Les Matchs
            </Text>
          </CardHeader>
        </Card>
        {loading === true &&
        <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
          <center><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></center>
          </Card>
            }
        {loading === false && dataMatch.map((element) => 
        <Card p='16px' marginTop=".2em" marginBottom=".2em" overflowX={{ sm: "scroll", xl: "hidden" }}>
          
        {element.CSGO &&
        <Accordion allowToggle>
        <AccordionItem borderTopWidth='0px'borderBottom='0px'>
        <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".2em">
          <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
             Counter-Strike Global Offensive ({element.CSGO.Live.length + element.CSGO.Upcoming.length})
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          {element.CSGO.Live.length > 0 &&
          <Box
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap='2em'>
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
              <Flex>
                <Text fontSize='lg' color='green' fontWeight='bold'pb='8px'>
                  Matchs En Direct :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.CSGO.Live.length}
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
                    Ligue
                  </Th>
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
                    Score
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
              {element.CSGO.Live.slice(pagesVisited, pagesVisited + usersPerPage).map((row, index, arr) => {
                
                  return (
                    <DashboardTableRow
                      matchName={row.match_name}
                      leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1score={row.team1_score}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2logo={row.team2_logo}
                      team2score={row.team2_score}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
                
              </Tbody>
            </Table>
            {element.CSGO.Live.length > usersPerPage &&
              <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          pageCount={pageCount(element.CSGO.Live.length??null)}
          onPageChange={changePage}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
            }
          </Card>
        </Box>
          }
          {element.CSGO.Upcoming.length > 0 &&
        <Box
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap='2em'>
          {/* Projects */}
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
            <Flex>
                <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                  Matchs A venir :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.CSGO.Upcoming.length}
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
                    Heure du Match
                  </Th>
                  <Th
                    
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Ligue
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Nom Du Match
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
              {element.CSGO.Upcoming.slice(pagesVisited2, pagesVisited2 + usersPerPage).map((row, index, arr) => {
                
                  return (
                    <DashboardTableRow
                      matchName={row.match_name}
                      leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2logo={row.team2_logo}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
              </Tbody>
            </Table>
            {element.CSGO.Upcoming.length > usersPerPage &&
            <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          pageCount={pageCount(element.CSGO.Upcoming.length??null)}
          onPageChange={changePage2}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
           }
          </Card>
          {/* Orders Overview */}
        </Box>
          }
          </AccordionPanel>
          </AccordionItem>
          </Accordion>
          }
          {element.Valorant &&
        <Accordion allowToggle>
        <AccordionItem borderTopWidth='0px'borderBottom='0px'>
        <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".2em">
          <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
             Valorant ({element.Valorant.Live.length + element.Valorant.Upcoming.length})
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          {element.Valorant.Live.length > 0 &&
           <Box
           templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
           gap='2em'>
           <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
             <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
               <Flex>
                 <Text fontSize='lg' color='green' fontWeight='bold'pb='8px'>
                   Matchs En Direct :
                 </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.Valorant.Live.length}
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
                    Ligue
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Nom Du Match
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
              {element.Valorant.Live.slice(pagesVisited3, pagesVisited3 + usersPerPage).map((row, index, arr) => {
                  return (
                    <DashboardTableRow
                    matchName={row.match_name}
                    leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1score={row.team1_score}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2score={row.team2_score}
                      team2logo={row.team2_logo}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
                
              </Tbody>
            </Table>
            {element.Valorant.Live.length > usersPerPage &&
              <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
          pageCount={pageCount(element.Valorant.Live.length??null)}
          onPageChange={changePage3}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
            }
          </Card>
        </Box>
          }
          {element.Valorant.Upcoming.length > 0 &&
        <Box
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        gap='2em'>
        <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
            <Flex>
              <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                Matchs A Venir :
              </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.Valorant.Upcoming.length}
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
                    Heure du Match
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Ligue
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign='center'>
                    Nom Du Match
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
              {element.Valorant.Upcoming.slice(pagesVisited4, pagesVisited4 + usersPerPage).map((row, index, arr) => {
                
                  return (
                    <DashboardTableRow
                    matchName={row.match_name}
                    leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2logo={row.team2_logo}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
              </Tbody>
            </Table>
            {element.Valorant.Upcoming.length > usersPerPage &&
            <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
          pageCount={pageCount(element.Valorant.Upcoming.length??null)}
          onPageChange={changePage4}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
           }
          </Card>
          {/* Orders Overview */}
        </Box>
      }
      </AccordionPanel>
      </AccordionItem>
      </Accordion>
        }
        {element.LOL &&
        <Accordion allowToggle>
        <AccordionItem borderTopWidth='0px'borderBottom='0px'>
        <AccordionButton bg="#242740" borderRadius='10em' justifyContent='center' m=".2em">
          <Box fontSize='lg' color='#fff' fontWeight='bold' pb='8px'>
             League Of Legends ({element.LOL.Live.length + element.LOL.Upcoming.length})
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          {element.LOL.Live.length > 0 &&
           <Box
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap='2em'>
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
              <Flex>
                <Text fontSize='lg' color='green' fontWeight='bold'pb='8px'>
                  Matchs En Direct :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.LOL.Live.length}
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
                    Ligue
                  </Th>
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
                    Score
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
              {element.LOL.Live.slice(pagesVisited5, pagesVisited5 + usersPerPage).map((row, index, arr) => {
                  return (
                    <DashboardTableRow
                    matchName={row.match_name}
                    leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1score={row.team1_score}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2score={row.team2_score}
                      team2logo={row.team2_logo}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
                
              </Tbody>
            </Table>
            {element.LOL.Live.length > usersPerPage &&
              <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
          pageCount={pageCount(element.LOL.Live.length??null)}
          onPageChange={changePage5}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
            }
          </Card>
        </Box>
          }
          {element.LOL.Upcoming.length > 0 &&
        <Box
          templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap='2em'>
          {/* Projects */}
          <Card p='16px' m='.2em' overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardHeader p='12px 0px 28px 0px' flexDirection='row' justifyContent='center'>
            <Flex>
                <Text fontSize='lg' color='red' fontWeight='bold'pb='8px'>
                  Matchs A venir :
                </Text>
                <Text fontSize='lg' color='white' fontWeight='bold' pb='8px'>
                  &nbsp;{element.LOL.Upcoming.length}
                </Text>
              </Flex>
            </CardHeader>
            <Table variant='simple' color='#fff'>
              <Thead>
              <Tr my='.8rem' ps='0px'>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                    borderBottomColor='#56577A' textAlign={'center'}>
                    Heure du Match
                  </Th>
                  <Th
                    color='gray.400'
                    fontFamily='Plus Jakarta Display'
                  
                    ps='0px'  borderBottomColor='#56577A' textAlign='center'>
                    Ligue
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
              {element.LOL.Upcoming.slice(pagesVisited6, pagesVisited6 + usersPerPage).map((row, index, arr) => {
                
                  return (
                    <DashboardTableRow
                    matchName={row.match_name}
                    leagueName={row.league}
                      begin_at={row.match_begin_at}
                      team1name={row.team1_name}
                      team1logo={row.team1_logo}
                      team2name={row.team2_name}
                      team2logo={row.team2_logo}
                      keyObj={row.match_name}
                      lastItem={index === arr.length - 1 ? true : false}
                    />
                  );
                })}
              </Tbody>
            </Table>
            {element.LOL.Upcoming.length > usersPerPage &&
            <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
          pageCount={pageCount(element.LOL.Upcoming.length??null)}
          onPageChange={changePage6}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
          />
           }
          </Card>
          {/* Orders Overview */}
        </Box>
      }
      </AccordionPanel>
      </AccordionItem>
      </Accordion>
        }
       </Card>
       
  )}
  
      </Flex>
    );
}
