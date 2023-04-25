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
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"
import axios from '../../api/index';
// Assets
import signInImage from "../../assets/img/signInImage.png";

// Custom Components
import AuthFooter from "../../components/Footer/AuthFooter";
import GradientBorder from "../../components/GradientBorder/GradientBorder";

function SignIn() {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [newpassword, setNewPassword] = useState('')
  const [newpasswordconfirm, setNewPasswordConfirm] = useState('')
  const { verifyCode } = useParams();
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
    if(newpassword?.length <= 6) {
            return setError('Votre mot de passe doit faire plus de 6 caractères.')
     }    
    if(newpassword !== newpasswordconfirm) {
      return setError('Vos mot de passes doivent correspondre.')
    } else {
            const captchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            axios.post(`/forgot-password/${verifyCode}/changepassword`, 
            { newpassword, newpasswordconfirm, recaptcha: captchaToken },
            {
              headers: { 'Content-Type': 'application/json' }
          }).then((e) => {
                if(e.status === 201) {
                        setSuccess(e?.data?.success)
                        return setTimeout(() => {
                            navigate('/auth/signin', { replace: true })
                      }, 7000) }
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
  const handleClick = () => setShow(!show)
  const handleClick1 = () => setShow1(!show1)
useEffect(async() => {
  if(window.self !== window.top) {
    return window.location.href="https://google.com"
  }
    await axios.get(`/fortgot-password/${verifyCode}/verifyrecovery`).then(e => {
        if(e?.status === 200) {
            setError(e?.data.error)
            return setTimeout(() => {
                            navigate('/auth/signin', { replace: true })
                      }, 4500) }
    })
    if(!verifyCode || verifyCode?.length !== 64) {
        navigate('/auth/signin', {replace: true})
    }
  document.title = "KoalaBestBet - Changer de mot de passe" ;
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
                  Mot de passe
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                    <InputGroup size='md'>
                    <Input
                     color='white'
                      bg='rgb(19,21,54)'
                       border='transparent'
                       borderRadius='20px'
                        fontSize='sm'
                         size='lg'
                         w={{ base: "100%", md: "346px" }}
                          name="password"
                           value={newpassword}
                           onChange={(e) => setNewPassword(e?.target.value)}  
                      maxW='100%'
                      type={show ? 'text' : 'password'}
                      placeholder="*******"
                        />
                    <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                    {show ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
                </GradientBorder>
              </FormControl>
              <FormControl>
                <FormLabel
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'
                  color='white'>
                  Confirmation du mot de passe
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                    <InputGroup size='md'>
                    <Input
                     color='white'
                      bg='rgb(19,21,54)'
                       border='transparent'
                       borderRadius='20px'
                        fontSize='sm'
                         size='lg'
                         w={{ base: "100%", md: "346px" }}
                          name="password"
                           value={newpasswordconfirm}
                           onChange={(e) => setNewPasswordConfirm(e?.target?.value)}  
                      maxW='100%'
                      type={show1 ? 'text' : 'password'}
                      placeholder="*******"
                        />
                    <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick1}>
                    {show1 ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
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
