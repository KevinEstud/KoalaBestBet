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

import React, {useState, useEffect, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
// Chakra imports
import {
  Alert,
  AlertIcon,
  DarkMode,
  Switch,
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  InputRightElement,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
// import {
//   requestLogin
// } from 'api/index';
import axios from '../../api/index';
// Assets
import signInImage from "../../assets/img/signInImage.png";

// Custom Components
import AuthFooter from "../../components/Footer/AuthFooter";
import GradientBorder from "../../components/GradientBorder/GradientBorder";

function SignIn() {
  const [email, setEmail] = useState();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const recaptchaRef = useRef(null)
  const textColor = "gray.400";
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  const onSubmit = async (e) =>  { 
    setError(false)
    setSuccess(false)
    e.preventDefault();
    try {
    if(!isValidEmail(email)) {
      return setError('Veuillez vérifier le mail saisis.')
    } else {
            const captchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            axios.post('/forgot-password', 
            { email, recaptcha: captchaToken },
            {
              headers: { 'Content-Type': 'application/json' }
          }).then((e) => {
                if(e.status === 201) {
                        setSuccess(e?.data?.success)
                        return setTimeout(() => {
                            navigate('/auth/signin', { replace: true })
                      }, 4500) }
                    else { 
                         setSuccess(false)
                  return setError(e?.data?.error)
                }
            })
          } }catch (err) {
              if (!err?.response) {
                  setError('No Server Response');
              } else if (err.response?.status === 401) {
                  setError('Unauthorized');
              } else {
                  setError('Login Failed');
              }
          }
}
useEffect(() => {

  document.title = "KoalaBestBet - Mot de passe oublié" ;
}, [])
    return (
      <Flex position='relative' overflow={{ lg: "hidden" }}>
        <meta http-equiv="X-Frame-Options" content="deny" />
      <Flex
        flexDirection='column'
        h={{ sm: "initial", md: "100vh" }}
        w={{ base: "90%" }}
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        pt={{ sm: "100px", md: "0px" }}
        me={{ base: "auto", lg: "50px", xl: "auto" }}>
        <Flex
          alignItems='center'
          justifyContent='start'
          style={{ userSelect: "none" }}
          flexDirection='column'
          mx={{ base: "auto", lg: "unset" }}
          ms={{ base: "auto", lg: "auto" }}
          mb='50px'
          w={{ base: "100%", md: "50%", lg: "42%" }}>
          <Flex
            direction='column'
            textAlign='center'
            justifyContent='center'
            align='center'
            mt={{ base: "60px", md: "140px", lg: "200px" }}
            mb='50px'>
          </Flex>
          <GradientBorder p='2px' me={{ base: "none", lg: "30px", xl: "none" }}>
            <Flex
              background='transparent'
              borderRadius='30px'
              direction='column'
              p='40px'
              minW={{ base: "unset", md: "430px", xl: "450px" }}
              w='100%'
              mx={{ base: "0px" }}
              bg={{
                base: "rgb(19,21,56)",
              }}>
              <Text
                fontSize='xl'
                color={textColor}
                fontWeight='bold'
                textAlign='center'
                mb='22px'>
                Récupérer mon mot de passe.
              </Text>
          {success &&
          <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
          <AlertIcon />{success}</Alert>
          }
          {error &&
          <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
          <AlertIcon />{error}</Alert>
          }
              <form onSubmit={onSubmit}>
              <FormControl>
                <FormLabel
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'
                  color='white'>
                  Email
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <Input
                    color='white'
                    bg='rgb(19,21,54)'
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    name="email"
                    w={{ base: "100%", md: "346px" }}
                    value={email}
                    onChange={(e) => setEmail(e?.target?.value)}  
                    maxW='100%'
                    h='46px'
                    placeholder={'votremail@mail.com'}
                  />
                </GradientBorder>
              </FormControl>
              <FormControl display='flex' alignItems='center'>
              <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
            size="invisible"
            />
            </FormControl>
              <center><Button
                variant='brand'
                fontSize='xs'
                type='submit'
                w='100%'
                maxW='350px'
                h='45'
                mb='20px'
                mt='20px'>
                Récupérer mon mot de passe
              </Button>
              </center>
              </form>
              <Flex
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                maxW='100%'
                mt='0px'>
                <Text color={textColor} fontWeight='medium'>
                  Vous rapplez-vous de votre mot de passe ?
                  <Link
                    style={{textDecoration: 'none',color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                    as='span'
                    ms='5px'
                    to='/auth/signin'
                    fontWeight='bold'>
                     &ensp;Me connecter
                  </Link>
                </Text>
              </Flex>
            </Flex>
              </GradientBorder>
          </Flex>
          <Box
            w={{ base: "335px", md: "450px" }}
            mx={{ base: "auto", lg: "unset" }}
            ms={{ base: "auto", lg: "auto" }}
            mb='80px'>
            <AuthFooter />
          </Box>
          <Box
            display={{ base: "none", lg: "block" }}
            overflowX='hidden'
            h='100%'
            maxW={{ md: "50vw", lg: "50vw" }}
            minH='100vh'
            w='960px'
            position='absolute'
            left='0px'>
            <Box
              bgImage={signInImage}
              w='100%'
              h='100%'
              bgSize='cover'
              bgPosition='50%'
              position='absolute'
              display='flex'
              flexDirection='column'
              justifyContent='center'
              alignItems='center'>
              <Text
                textAlign='center'
                color='white'
                letterSpacing='8px'
                fontSize='20px'
                fontWeight='500'>
                KoalaBestBet:
              </Text>
              <Text
                textAlign='center'
                color='transparent'
                letterSpacing='8px'
                fontSize='36px'
                fontWeight='bold'
                bgClip='text !important'
                bg='linear-gradient(94.56deg, #FFFFFF 79.99%, #21242F 102.65%)'>
                Vous aussi venez vous mesurer à vos amis et à la communauté de KoalaBestBet
              </Text>
            </Box>
          </Box>
          
        </Flex>
      </Flex>

    );
}

export default SignIn; 
