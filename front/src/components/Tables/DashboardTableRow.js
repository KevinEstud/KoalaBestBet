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
/* eslint-disable no-unused-vars */
import {
  Avatar,
  AvatarGroup,
  Flex,
  Image,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Checkbox,
  CheckboxGroup
} from "@chakra-ui/react";

import React, {useState, useEffect} from "react";

function DashboardTableRow(props) {
  const { matchName, keyObj, lastItem, team1name, begin_at, team1logo, team2logo, team2name, checkbox, team1score, team2score, matchId, leagueName} = props;
  return (
    <Tr key={keyObj}>
        {(checkbox)&& 
        <Td
        ps='0px'
        borderBottomColor='#56577A'
        border={lastItem ? "none" : null} textAlign='center' value={matchId}>
        <Checkbox value={matchId} onChange={(e) => this.setMatchSelected(e.target.value)} id={matchId} name={matchId} />
        </Td>
        }
        {begin_at &&
      <Td
        minWidth={{ sm: "250px" }}
        ps='0px'
        borderBottomColor='#56577A'
        border={lastItem ? "none" : null} textAlign='center'>
        <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap' marginRight={'auto'} marginLeft={'auto'}>
          <Text fontSize='sm' color='#fff' fontWeight='normal' minWidth='100%'>
            {begin_at}
          </Text>
        </Flex>
      </Td>

        }
        {leagueName &&
      <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
        <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
          {leagueName}
        </Text>
      </Td>

        }
        {matchName &&
      <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
        <Text fontSize='sm' color='#fff' fontWeight='bold' pb='.5rem' marginRight={'auto'} marginLeft={'auto'}>
          {matchName}
        </Text>
      </Td>

        }
        {(team1score !== undefined && team2score !== undefined) && (team1name && team2name) &&

      <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center'>
        <Flex direction='column'>
          
          <Text
            fontSize='sm'
            color='#fff'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'}>
              {team1logo && <Image borderRadius='full' boxSize='24px' src={team1logo} alt={`${team1name} logo`} /> }
            {team1name}
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {team1score}
            </Text> vs
            
            <Text
            fontSize='sm'
            color='green'
            fontWeight='bold'
            pb='.2rem' display='-webkit-inline-box'> {team2score}
            </Text> {team2name} {team2logo && <Image borderRadius='full' boxSize='24px' src={team2logo} alt={`${team2name} logo`} /> }
            </Text>
          
        </Flex>
      </Td>
        }
          {(team1score === undefined && team2score === undefined) && (team1name && team2name) &&

          <Td borderBottomColor='#56577A' border={lastItem ? "none" : null} textAlign='center' >
          <Flex direction='column'>
    
          <Text
         fontSize='sm'
           color='#fff'
           fontWeight='bold'
           pb='.2rem' display='-webkit-inline-box' marginRight={'auto'} marginLeft={'auto'} >
               {team1logo && <Image borderRadius='full' boxSize='24px' src={team1logo} alt={`${team1name} logo`} /> }{team1name} vs {team2name} {team2logo && <Image borderRadius='full' boxSize='24px' src={team2logo} alt={`${team2name} logo`} />}
            </Text>
    
          </Flex>
          </Td>
          }
          
    </Tr>
  );
}

export default DashboardTableRow;
