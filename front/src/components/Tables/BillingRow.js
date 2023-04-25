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
import { Box, Button, Flex, Icon, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { GiPodium } from "react-icons/gi";
import React from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import useAxiosPrivate from "hooks/useAxiosPrivate";

function Row(props) {
  const axiosPrivate = useAxiosPrivate();
  const { group_id, name, nb_participants, nb_participants_max, hasBet, bg_image, number_of_group, isLeader } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const confirmLeave = async (e) => {
    e.preventDefault();
    await axiosPrivate.delete(`/delete-group/group/${e.target.value}`).then(res => {
      if(res.status === 201) {
       
      }
    })
  }
  return (
    <Box
      p='24px'
      bgImage={bg_image}
      bgPosition="0 -21em"
      my='22px'
      borderRadius='20px'>
      <Flex justify='space-around' w='100%'>
            
        <Flex direction='column'justify='center' alignItems='center' maxW='100%'>
        <Card bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" backdropFilter='blur(42px)' borderRadius="1em" p='1em' flexDirection='column' alignItems='center'>
          <Text color='gray.400' fontSize='s'>
            <Text as='span' color='white'>
               {name}
            </Text>
          </Text>
          
          <Text color='white' fontSize='xs' flexDirection='column'>
              {nb_participants !== nb_participants_max &&
              <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
                Status du groupe : 
                <Text as='span' color='gray' > En attente de joueurs</Text>
                <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
              {nb_participants}/{nb_participants_max}
                </Text>
              </Text>
              
              }
                {nb_participants === nb_participants_max &&
                <Text as='span' color='white'>
                  Status du groupe : 
                 <Text as='span' color='green' > Groupe Plein </Text>
                <Text as='span' color='white' display='flex' flexDir='column' alignItems='center'>
              {nb_participants}/{nb_participants_max}
                </Text>
              </Text>
                }
            
          </Text> 
          </Card>
        </Flex>
            
        <Flex direction={{ sm: "column", md: "row" }} align='flex-start'>

          <Flex bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" borderRadius="1em" backdropFilter='blur(42px)' p='1em' alignItems='center'>
        {hasBet === false &&
               <Button p='0px' variant='no-hover'>
               <Flex color='#fff' cursor='pointer' align='center' p='12px'>
                 <Icon as={FaPencilAlt} me='4px' w='14px' h='14px' />
                 <Text fontSize='xs' color='gray.400'>
                   Pronotisquer
                 </Text>
               </Flex>
             </Button>
             
              }
              {hasBet === true &&
               <Button p='0px' variant='no-hover'>
               <Flex color='#fff' cursor='pointer' align='center' p='12px'>
                 <Icon as={GiPodium} me='4px' w='14px' h='14px' />
                 <Text fontSize='xs' color='gray.400'>
                   Voir Classement
                 </Text>
               </Flex>
             </Button>
              }
              </Flex>
              {isLeader ?
              <Flex bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" backdropFilter='blur(42px)' p='1em' marginLeft=".2em" alignItems='center'>
              <Button
              p='0px'
              variant='no-hover'
              mb={{ sm: "10px", md: "0px" }}
              me={{ md: "12px" }} onClick={onOpen}>
              <Flex color='red.500' cursor='pointer' align='center' p='12px'>
                <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
                <Text fontSize='xs'>Supprimer le groupe</Text>
              </Flex>
            </Button>
            <Modal
              isCentered
              onClose={onClose}
              isOpen={isOpen}
              motionPreset='slideInBottom'
            >
              <ModalOverlay />
              <ModalContent marginRight=".5em" marginLeft=".5em" justifyContent='center' alignItems='center'>
                <ModalHeader>Êtes-vous sur de vouloir supprimer le groupe? </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <ModalFooter>
                  <Button mr={3} onClick={onClose}>
                    Fermer
                  </Button>
                  <Button value={group_id} onClick={confirmLeave} variant='ghost'>Oui</Button>
                </ModalFooter>
                </ModalBody>
              </ModalContent>
            </Modal>
            </Flex>
              :
              <Flex bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)" maxWidth="90%" borderRadius="1em" backdropFilter='blur(42px)' p='1em' marginLeft=".2em" alignItems='center'>
              <Button
            p='0px'
            variant='no-hover'
            mb={{ sm: "10px", md: "0px" }}
            me={{ md: "12px" }} onClick={onOpen}>
            <Flex color='red.500' cursor='pointer' align='center' p='12px'>
              <Icon as={FaTrashAlt} me='4px' w='16px' h='16px' />
              <Text fontSize='xs'>Quitter le groupe</Text>
            </Flex>
          </Button>
          <Modal
            isCentered
            onClose={onClose}
            isOpen={isOpen}
            motionPreset='slideInBottom'
          >
            <ModalOverlay />
            <ModalContent marginRight=".5em" marginLeft=".5em" justifyContent='center' alignItems='center'>
              <ModalHeader>Êtes-vous sur de vouloir quitter le groupe? </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              <ModalFooter>
                <Button mr={3} onClick={onClose}>
                  Fermer
                </Button>
                <Button value={group_id} onClick={confirmLeave} variant='ghost'>Oui</Button>
              </ModalFooter>
              </ModalBody>
            </ModalContent>
          </Modal>
          </Flex>

              }
        </Flex>
        </Flex>
        </Box>
    );
}

export default Row;
