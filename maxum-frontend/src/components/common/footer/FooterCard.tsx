import React from 'react'
import './Footer.scss'
import { Col, Container, Row } from 'react-bootstrap'
import Image from 'next/image'
import Link from 'next/link'
import CommonButton from '../ui/commonButton/CommonButton'
import { PlayIcon } from '@/assets/icons/svgIcon'
import logo from '../../../../public/images/logo.png'

const FooterCard = () => {
    return (
        <>
            <footer className='footerCard'>
                <Container>
                    <Row className='align-items-center'>
                        <Col xs={12} md={12}>
                            <div className='footerCard_logo text-center mb-4'>
                                <Image src={logo} alt="logo" />
                            </div>
                        </Col>
                        <Col xs={12} md={12} className='my-4 my-md-0 py-2 py-md-0'>
                            <div className='footerCard_footerLink'>
                                <Link href="#about">About Us</Link>
                                <Link href="#pricing">Pricing</Link>
                                <Link href="#contact">Contact Us</Link>
                                <Link href="/terms-and-conditions">Terms & Conditions</Link>
                                <Link href="/privacy-policy">Privacy Policy</Link>
                            </div>
                        </Col>
                        {/* <Col xs={12} md={3} className='text-center text-md-end'>
                            <CommonButton title='View Demo' className='border-btn' />
                        </Col> */}
                    </Row>
                </Container>
            </footer>
        </>
    )
}

export default FooterCard