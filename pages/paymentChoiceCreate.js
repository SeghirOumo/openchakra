import React, {Fragment} from 'react';
import Link from 'next/link';
import Layout from '../hoc/Layout/Layout';
import axios from "axios";
import moment from 'moment';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Router from "next/router";
import { withStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Footer from '../hoc/Layout/Footer/Footer';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from "@material-ui/core/Radio";
import Tooltip from '@material-ui/core/Tooltip';
import Cards from "react-credit-cards";






moment.locale('fr');

const { config } = require('../config/config');
const url = config.apiUrl;

const styles = theme => ({
    bigContainer: {
        marginTop: 70,
        flexGrow: 1,
    },
    hidesm: {
        minWidth: '271px',
        [theme.breakpoints.down('sm')]: {
            display:'none'
        }
    }

    ,hidelg: {
        [theme.breakpoints.up('md')]: {
            display:'none',
        }

    },
    trigger:{
        [theme.breakpoints.down('sm')]: {
            marginTop: -10,
            width: '100%',
            marginLeft:'0px',
            height:'30px',
            backgroundColor:'#2FBCD3',

            display:'block',
            transition: 'display 0.7s',
            borderRadius:'5px',
            '&:focus': {
                display:'none',
                transition: 'display 0.7s',

            }
        }

    },
    respright:{
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        }
    }

    ,toggle: {
        [theme.breakpoints.down('sm')]: {  marginLeft:'-75px',
            transition: 'margin-left 0.7s',

            '&:hover': {
                marginLeft:'0px',
                transition: 'margin-left 0.7s',
                boxShadow: '11px 6px 23px -24px rgba(0,0,0,0.75)',

            }
        }
    }

});

class PaymentChoiceCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            cards: [],
            id_card: '',
            cardSelected: false,
        }

    }

    static getInitialProps ({ query: { total, fees } }) {
        return { total: total, fees:fees }

    }

    componentDidMount() {

        localStorage.setItem('path',Router.pathname);
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        axios
            .get(url+'myAlfred/api/users/current')
            .then(res => {
                this.setState({user: res.data});
            })
            .catch(err => {
                    console.log(err);
                    if(err.response.status === 401 || err.response.status === 403) {
                        localStorage.removeItem('token');
                        Router.push({pathname: '/login'})
                    }
                }
            );

        axios.get(url+'myAlfred/api/payment/cardsActive')
            .then(response => {
                let cards = response.data;
                this.setState({cards:cards});
            })
    }

    payDirect() {
        const total = parseFloat(this.props.total);
        const fees = parseFloat(this.props.fees)*2;
        const data = {
            id_card: this.state.id_card,
            amount: total,
            fees: fees
        };
        axios.post(url+'myAlfred/api/payment/payInDirectCreate',data)
            .then(() => {
                Router.push('/paymentDirectSuccessCreate')

            })
            .catch()
    }

    pay(){
        const total = parseFloat(this.props.total);
        const fees = parseFloat(this.props.fees)*2;
        const data = {
            amount: total,
            fees: fees
        };
        axios.post(url+'myAlfred/api/payment/payInCreate',data)
            .then(res => {
                let payIn = res.data;
                Router.push(payIn.RedirectURL)
            })
    }






    render() {
        const {classes} = this.props;
        const {user} = this.state;
        const {cards} = this.state;


        return (
            <Fragment>
                <Layout>
                    <Grid container className={classes.bigContainer}>

                        <Grid item xs={12} style={{paddingLeft: 55,minHeight: '510px'}}>
                            <Grid container>
                                <h1 style={{color: 'dimgray',fontWeight: '100'}}>Choix du mode de paiement</h1>
                            </Grid>
                            <Grid container>
                                <Grid item xs={12} md={6} style={{display: "inline-block"}}>
                                    {cards.length ?
                                        <React.Fragment>

                                            {cards.map((e,index) => (
                                                <React.Fragment>
                                                    {this.state.id_card === e.Id ?
                                                        <Grid key={index} value={e.Id} onClick={()=>{this.setState({id_card:e.Id});this.setState({cardSelected: true})}} style={{width: '296px',boxShadow: '0px 0px 6px lightgray',border: 'rgb(79, 189, 215) solid 3px', cursor: 'pointer', borderRadius: '16px', margin: '20px', position: 'relative', height: '189px'}}>
                                                            <Cards
                                                                expiry={e.ExpirationDate}
                                                                focused={this.state.focus}
                                                                name={this.state.name}
                                                                number={e.Alias.replace(/X/g,'*')}
                                                                callback={this.handleCallback}
                                                                preview
                                                                cvc={'XXX'}
                                                            />
                                                        </Grid>
                                                        :
                                                        <Grid key={index} value={e.Id} onClick={()=>{this.setState({id_card:e.Id});this.setState({cardSelected: true})}} style={{width: '296px',boxShadow: '0px 0px 6px lightgray', cursor: 'pointer', borderRadius: '16px', margin: '20px', position: 'relative', height: '186px'}}>
                                                            <Cards
                                                                expiry={e.ExpirationDate}
                                                                focused={this.state.focus}
                                                                name={this.state.name}
                                                                number={e.Alias.replace(/X/g,'*')}
                                                                callback={this.handleCallback}
                                                                preview
                                                                cvc={'XXX'}
                                                            />
                                                        </Grid>
                                                    }



                                                </React.Fragment>

                                            ))}
                                            {this.state.id_card === this.state.valueother ?
                                                <Grid value={this.state.valueother} onClick={()=>{this.setState({id_card:"other"});this.setState({cardSelected: false})}} style={{width:'296px', boxShadow: '0px 0px 6px lightgray', height: '40px',border: 'rgb(85, 155, 215) solid 2px', cursor: 'pointer', borderRadius: '5px', margin: '20px', position: 'relative',backgroundColor: '#2FBCD3',color: 'white'}}>
                                                    <p style={{textAlign: "center", lineHeight: 2, position: "absolute", top: 0, left: 0, right: 0, margin: 'auto'}}>Autre</p>
                                                </Grid>
                                                :
                                                <Grid value={this.state.valueother} onClick={()=>{this.setState({id_card:"other"});this.setState({cardSelected: false})}} style={{width:'296px', boxShadow: '0px 0px 6px lightgray', height: '40px', cursor: 'pointer', borderRadius: '5px', margin: '20px', position: 'relative',backgroundColor: '#2FBCD3',color: 'white'}}>
                                                    <p style={{textAlign: "center", lineHeight: 2, position: "absolute", top: 0, left: 0, right: 0, margin: 'auto'}}>Autre</p>
                                                </Grid>
                                            }
                                        </React.Fragment>
                                        :

                                        <p>Aucun mode de paiement enregistré</p>

                                    }

                                    <Grid style={{width:'296px', height: '40px', margin: '20px', position: 'relative'}}>
                                        {this.state.cardSelected ?
                                            <Button onClick={()=>this.payDirect()} type="submit" variant="contained" style={{color: 'white',position: 'absolute', left: 0, right: 0, margin: 'auto', marginBottom: '30px'}} color="primary">
                                                Payer en 1 clic
                                            </Button>
                                            :
                                            <Button onClick={()=>this.pay()} type="submit" variant="contained" style={{color: 'white',position: 'absolute', left: 0, right: 0, margin: 'auto', marginBottom: '30px'}} color="primary">
                                                Payer
                                            </Button>
                                        }
                                    </Grid>
                                </Grid>
                                <Grid item xs={6} className={classes.respright}>
                                    <img style={{position: 'sticky', top: 5}} src="../static/resa.svg" alt="beaver"/>
                                </Grid>

                            </Grid>


                        </Grid>
                    </Grid>
                </Layout>
                <Footer/>

            </Fragment>
        );
    };
}



export default withStyles(styles)(PaymentChoiceCreate);
