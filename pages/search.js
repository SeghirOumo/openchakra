import React, { Fragment } from 'react';
import Layout from '../hoc/Layout/Layout';
import Footer from '../hoc/Layout/Footer/Footer';
import Grid from "@material-ui/core/Grid";
import { withStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Search from "@material-ui/icons/Search";
import axios from "axios";
import Router from "next/dist/client/router";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Link from 'next/link';
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import moment from "moment";
import StarRatings from 'react-star-ratings';
import 'react-dates/lib/css/_datepicker.css';
import Tooltip from '@material-ui/core/Tooltip';
import CardPreview from '../components/CardPreview/CardPreview';
import SerenityNeed from '../components/home/SerenityNeed/SerenityNeed';
import Profiteandlearn from '../components/home/profite&learn/profite&learn'
import BecomeAlfred from '../components/home/BecomeAlfred/BecomeAlfred';
import NearbyYou from '../components/home/NearbyYou/NearbyYou';
import Homeheader from '../components/home/Homeheader/Homeheader';
import FeelingGood from '../components/home/feelingGood/feelingGood';
import Wellbeing from '../components/home/Wellbeing/Wellbeing';
import Proposeservice from '../components/home/proposeservice/Proposeservice';
import Assureback from '../components/home/AssureBack/Assureback';
import Section3 from '../components/home/section3';
import Section6 from '../components/home/section6';
import Section8 from '../components/home/section8';
import Passions from '../components/home/Passions/passions';
import Facons from '../components/home/Facons/facons';
import Otter from '../components/home/Otter/otter';
import Section10 from '../components/home/section10';
import Section12 from '../components/home/section12';
import Section15 from '../components/home/section15';
import Section16 from '../components/home/section16';
import Section18 from '../components/home/section18';
import Section19 from '../components/home/section19';
import Section21 from '../components/home/section21';
import Section22 from '../components/home/section22';
const {isIntervalAvailable} = require('../utils/dateutils');

const geolib = require('geolib');
const _ = require('lodash');

moment.locale('fr');
const styles = theme => ({
    bigContainer: {
        marginTop: 80,
        minHeight: 530
    },
    card: {
        margin: 20,
    },
    media: {
      height: "250px!important",
      position: 'relative',
      objectFit: 'cover',
    },
    respfilter:{
        [theme.breakpoints.down('sm')]: {
            top: 200,
        }
    },
    mobilevoir: {
        [theme.breakpoints.up("md")]: {
            display: "none!important"
        }
    },
    webvoir: {
        [theme.breakpoints.down("sm")]: {
            display: "none!important"
        }
    },
    DateInput_input__focused:{
        borderBottom: '1px solid #fb1515!important',
    },
    algol: {
        fontFamily: 'Helvetica Neue, Helvetica,sans-serif',
        '::placeholder':{
            color: '#cfcfcf',
        },
        '&:hover':{
            border: '1px solid black!important',
            transition: 'border 0.5s',
        },
        '&:focus':{
            border: '2px solid #2FBCD3!important',
            transition: 'border 0.5s',
        }
    },
    separatorBlue:{
     width: '150px'
    }
});

class SearchPage extends React.Component {

    // FIX : page blanche quand redirigée depuis home page non connectée
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            address: {},
            selectedAddress: {},
            city: '',
            gps: null,
            categories: [],
            serviceUsers: [],
            serviceUsersDisplay: [],
            shops: [],
            proAlfred: [], // Professional Alfred ids
            keyword: '',
            proSelected: false, // Filtre professionnel
            individualSelected: false, // Filtre particulier
            startDate: null,
            endDate: null,
            focusedInput: null,
            statusFilterVisible:false,
            dateFilterVisible:false,
            visibleCategories:[],
            catCount:{}, // cat id => # of items to display
            availabilities:[],
        };
        this.filter=this.filter.bind(this);
    }

    static getInitialProps ({ query: { keyword, city, gps, selectedAddress, category, service, prestation, search, date} }) {
      // FIX : set city nin AlgoPlaces if provided
      var init= { keyword: keyword, city:city, selectedAddress:selectedAddress, category:category, service:service, prestation:prestation, search:search, date:date}
      if (gps) {
        init['gps']=gps;
      }
      return init;
    }

    onChangeCity({suggestion}) {
      this.setState({gps:suggestion.latlng, city: suggestion.name});
    };

    onChangeInterval(startDate, endDate) {
      if (startDate) { startDate.hour(0).minute(0).second(0).millisecond(0)};
      if (endDate) { endDate.hour(23).minute(59).second(59).millisecond(999)};
      this.setState({startDate:startDate, endDate:endDate});
    }

    componentDidUpdate(prevProps) {
      if (this.props!== prevProps) {
        window.location.reload()
      }
    }
    componentDidMount() {
        // Mount components gets criterion from URL
        // If date in URL then force filter after search
        var st={
          keyword:'keyword' in this.props ? this.props.keyword : '',
          gps:'gps' in this.props ? JSON.parse(this.props.gps) : null,
          city:this.props.city || '',
        };
        if ('date' in this.props && this.props.date) {
          var startDate=moment(parseInt(this.props.date));
          startDate.hour(0).minute(0).second(0);
          var endDate=moment(parseInt(this.props.date));
          endDate.hour(23).minute(59).second(59);
          st['startDate']=startDate;
          st['endDate']=endDate;
        }
        if ('category' in this.props) {
          st['category']=this.props.category;
        }
        if ('service' in this.props) {
          st['service']=this.props.service;
        }
        if ('prestation' in this.props) {
          st['prestation']=this.props.prestation;
        }
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

        axios.get('/myAlfred/api/category/all/sort')
          .then(res => {
            st['categories']=res.data;
            var catCount={}
            res.data.forEach( c => catCount[c._id]=8);
            st['catCount']=catCount;
             axios.get('/myAlfred/api/shop/all')
               .then( res => {
                  st['shops']=res.data;
                  axios.get('/myAlfred/api/users/current')
                    .then(res => {
                      let user = res.data;
                      st['user']=user;
                      var allAddresses={'main': user.billing_address.gps}
                      user.service_address.forEach( ad => allAddresses[ad._id]={lat:ad.lat, lng:ad.lng});
                      st['allAddresses']= allAddresses;
                      if ('selectedAddress' in this.props && this.props['selectedAddress']!='all') {
                         st['gps']=allAddresses[this.props.selectedAddress];
                      }
                      if (!this.props['selectedAddress'] && !this.props['gps']) {
                         st['gps']=allAddresses['main'];
                         st['selectedAddress']='main';
                      }
                      this.setState(st, () => { if ('search' in this.props) {this.search('date' in this.props)}});
                    })
                    .catch(err => {
                      this.setState(st, () => { if ('search' in this.props) {this.search('date' in this.props)}});
                    });
               })
           })
           .catch(err => { console.log(err)});
    }

    onChange = e => {
        var {name, value} = e.target;
        console.log("onChange:"+name+","+value);
        this.setState({ [e.target.name]: e.target.value });
        if (name === 'selectedAddress') {
          this.setState({gps: value === 'all'?null: 'gps' in value ? value.gps : {'lat':value['lat'], 'lng':value['lng']}})
        }
    };

    statusFilterChanged = event => {
        const {name, checked} = event.target;
        this.setState({[event.target.name]: event.target.checked, statusFilterVisible: false}, () => this.filter() );
    };

    resetFilter() {
      this.setState({
        proSelected: false,
        individualSelected: false,
        startDate: null,
        endDate: null,
      }, () => this.filter())
    }

    // Filter according to pro or particular && dates
    filter() {
      const serviceUsers=this.state.serviceUsers;
      var serviceUsersDisplay=[];
      if (this.state.proSelected || this.state.individualSelected) {
        serviceUsers.forEach( su => {
          var alfId = su.user._id;
          const isPro = this.state.proAlfred.includes(alfId);
          if (isPro && this.state.proSelected || !isPro && this.state.individualSelected) serviceUsersDisplay.push(su);
        });
      } else {
        serviceUsersDisplay=serviceUsers;
      }

      const start=this.state.startDate;
      const end=this.state.endDate;

      if (start && end) {
        console.log("Before:"+serviceUsersDisplay.length);
        const filtered = [];
        serviceUsersDisplay.forEach( su => {
          if (isIntervalAvailable(start, end, su.service._id, this.state.availabilities.filter( a => a.user==su.user._id))) {
            filtered.push(su);
          }
        });
        serviceUsersDisplay=filtered;
        console.log("After:"+serviceUsersDisplay.length);
      }

      var visibleCategories=[];
      this.state.categories.forEach(e => {
        serviceUsersDisplay.forEach(a => {
          if(a.service.category._id === e._id){
            visibleCategories.push(e.label);
          }
        })
      })

      this.setState({serviceUsersDisplay: serviceUsersDisplay, visibleCategories:visibleCategories});
    }

     search(forceFilter) {
       const address = this.state.selectedAddress;
        var filters={}

        // GPS
        if (this.state.gps) { filters['gps']=this.state.gps; }
       // Keyword search disables cat/ser/presta filter
       if (this.state.keyword) { filters['keyword']=this.state.keyword; }
       else {
         // Category
         if (this.props.category) { filters['category']=this.props.category; }
         // Service
         if (this.props.service) { filters['service']=this.props.service; }
         // Prestation
         if (this.props.prestation) { filters['prestation']=this.props.prestation; }
       }

       axios.post('/myAlfred/api/serviceUser/search', filters)
         .then(res => {
           let serviceUsers = res.data;
           this.setState({serviceUsers:serviceUsers, serviceUsersDisplay:serviceUsers});
           const categories = this.state.categories
           var visibleCategories=[];
           categories.forEach(e => {
             serviceUsers.forEach(a => {
               if(a.service.category._id === e._id){
                 visibleCategories.push(e.label);
               }
             })
           })
           var proAlfred=this.state.shops.filter( s => s.is_professional).map( s => s.alfred._id);
           axios.get('/myAlfred/api/availability/all')
             .then( res => {
               this.setState({availabilities: res.data, visibleCategories:visibleCategories, categories:categories, proAlfred:proAlfred}, () => { if (forceFilter) { this.filter()}});
             });
         })
    }

    statusFilterToggled(){
      this.setState({statusFilterVisible: !this.state.statusFilterVisible});
    }

    dateFilterToggled(){
      this.setState({dateFilterVisible: !this.state.dateFilterVisible});
    }

     cancelDateFilter(){
       this.setState({startDate:null,endDate:null,dateFilterVisible:false}, () => this.filter());
     }

     validateDateFilter(){
       this.setState({dateFilterVisible:false}, () => this.filter());
     }

    restrictServices(serviceUsers, category) {
      const nbToDisplay=this.state.catCount[category._id];
      const su = serviceUsers.filter( s => s.service.category._id === category._id).slice(0, nbToDisplay);
      console.log(su, 'su');
      return su;
    }

    hasMoreToDisplay(serviceUsers, category) {
      const nbToDisplay=this.state.catCount[category._id];
      const nbTotal = serviceUsers.filter( s => s.service.category._id === category._id).length;
      return nbTotal>nbToDisplay;
    }

    increaseCount(category) {
      var counts=this.state.catCount;
      counts[category._id]=counts[category._id]+8;
      this.setState({catCount:counts});
    }

    isStatusFilterSet() {
      return this.state.proSelected || this.state.individualSelected;
    }

    isDateFilterSet() {
      return this.state.startDate!=null || this.state.endDate!=null;
    }

    isSubFilterSet() {
      return this.isStatusFilterSet() || this.isDateFilterSet();
    }

    render() {
        const {classes} = this.props;
        const {user, categories, gps} = this.state;
        var keyword = this.state.keyword;
        const serviceUsers = this.state.serviceUsersDisplay;
        keyword = keyword ? keyword.trim() : '';

        const statusFilterBg=this.isStatusFilterSet() ? '#2FBCD3':'white';
        const dateFilterBg=this.isDateFilterSet() ? '#2FBCD3':'white';

        return (
          <Fragment>
            <Layout>
              <Grid container className={classes.bigContainer}>
                <Grid container className={classes.respfilter} style={{position: 'sticky', top: 60, zIndex: 10, background: 'white', height: 60}}>
                  <Grid item xs={12} style={{height: 50}}>
                    <Grid container>
                      {this.state.statusFilterVisible ?
                        <Grid item xs={5} md={3}  style={{borderRadius: '15px', backgroundColor: '#2FBCD3', boxShadow: 'rgba(125, 125, 125, 0.5) 0px 0px 10px 3px inset', cursor: 'pointer', height: '45px', margin: 10}}>
                          <Typography onClick={()=> this.statusFilterToggled()} style={{textAlign: 'center', color:'white', fontSize: '0.8rem', paddingTop: 13, height:43}}>Statut</Typography>
                            <Grid id="status" item xs={12}  style={{borderRadius: '15px', backgroundColor: 'white', boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px', height: '100px', marginTop: 8,padding:10,zIndex: 1}}>
                              <Grid container>
                                <Grid item xs={12} style={{textAlign:'center', margin: 'auto'}} spacing={3}>
                                  {this.state.individualSelected ? <Grid item xs={3}></Grid> :
                                    <Grid item xs={6} sm={4} md={3} style={{textAlign:'center', margin: 'auto'}}>
                                      <FormControlLabel
                                        control={
                                          <Switch
                                              checked={this.state.proSelected}
                                              onChange={e=>{this.statusFilterChanged(e);this.filter()}}
                                              value={this.state.proSelected}
                                              color="primary"
                                              name={'proSelected'}
                                          />
                                        }
                                          label="Pro"
                                      />
                                      </Grid>
                                  }
                                  </Grid>
                                  <Grid item xs={12} style={{textAlign:'center', margin: 'auto'}}>
                                    {this.state.proSelected ? null :
                                      <Grid item xs={6} sm={4} md={3} style={{textAlign:'center', margin: 'auto'}}>
                                        <FormControlLabel
                                          control={
                                            <Switch
                                                checked={this.state.individualSelected}
                                                onChange={e=>{this.statusFilterChanged(e);this.filter()}}
                                                value={this.state.individualSelected}
                                                color="primary"
                                                name={'individualSelected'}
                                            />
                                          }
                                            label="Particulier"
                                        />
                                        </Grid>
                                    }
                                  </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                          :
                          <Grid key={moment()} item xs={5} md={3} onClick={()=> this.statusFilterToggled()} style={{borderRadius: '15px', backgroundColor: `${statusFilterBg}`, boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px', cursor: 'pointer', height: '45px', margin: 10}}>
                              <Typography style={{textAlign: 'center', fontSize: '0.8rem', height:43,paddingTop: 13}}>Statut</Typography>
                          </Grid>
                      }
                        {this.state.dateFilterVisible ?
                          <Grid item xs={5} md={3}  style={{borderRadius: '15px', backgroundColor: '#2FBCD3', boxShadow: 'rgba(125, 125, 125, 0.5) 0px 0px 10px 3px inset', cursor: 'pointer', height: '45px', margin: 10}}>
                            <Typography onClick={()=> this.dateFilterToggled()} style={{textAlign: 'center', color:'white', fontSize: '0.8rem',paddingTop:13,height:43}}>Quelle(s) date(s) ?</Typography>
                              <Grid id="thedate" item xs={12} style={{borderRadius: '15px', backgroundColor: 'white', boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px', height: 'auto', marginTop: 8,zIndex: 1, padding: 10}}>
                                <Grid container>
                                  <Grid item xs={12} style={{textAlign:'center', margin: 'auto'}}>
                                    <DateRangePicker
                                        style={{width: '50px'}}
                                        startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                                        startDatePlaceholderText={'Début'}
                                        endDatePlaceholderText={'Fin'}
                                        startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                                        endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                                        endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                                        onDatesChange={({ startDate, endDate }) => this.onChangeInterval(startDate, endDate)} // PropTypes.func.isRequired,
                                        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                        onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                                        minimumNights={0}
                                        numberOfMonths={1}
                                    />
                                    </Grid>
                                    <Grid item xs={12} style={{textAlign:'center', margin: 'auto'}}>
                                      <Grid container>
                                        <Grid item xs={6}>
                                          <Button style={{fontSize: '0.8rem',}} onClick={()=>this.cancelDateFilter()}>Annuler</Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Button style={{fontSize: '0.8rem',}} onClick={()=>this.validateDateFilter()}>Valider</Button>
                                        </Grid>
                                        </Grid>
                                    </Grid>
                                  </Grid>
                              </Grid>
                          </Grid>
                            :
                          <Grid item xs={5} md={3} onClick={()=> this.dateFilterToggled()} style={{borderRadius: '15px', backgroundColor: `${dateFilterBg}`, boxShadow: 'rgba(164, 164, 164, 0.5) 0px 0px 5px 0px', cursor: 'pointer', height: '45px', margin: 10}}>
                              <Typography style={{textAlign: 'center', fontSize: '0.8rem',paddingTop:13,height:43 }}>Quelle(s) date(s) ?</Typography>
                          </Grid>
                        }
                        </Grid>
                       </Grid>
                  </Grid>
                  { /* END FILTER PANEL */ }
                  <Grid container>
                    <h3 style={{marginLeft: '15px', fontSize: '1.1rem', color: '#545659'}}>Que recherchez-vous {user?user.firstname:''} ?</h3>
                  </Grid>
                    <Grid container className="scrollLittle" style={{overflowX: 'scroll', whiteSpace: 'nowrap', display: 'inline-block', minHeight: '250px'}}>
                      {categories.map((cat, index) => (
                        <Grid key={index} style={{display: 'inline-block', width: '300px', margin: 'auto 20px'}}>
                          <Link href={'/search?search=1&category='+cat._id+(gps?'&gps='+JSON.stringify(gps):'')}>
                            <Card  style={{width: '300px', margin: '20px auto', borderRadius: '35px', height: '250px'}} className={classes.card}>
                              <CardActionArea>
                                <CardMedia
                                    style={{height:200}}
                                    image={cat.picture}
                                    title={cat.label}
                                />
                                <CardContent style={{padding: '5px'}}>
                                  <Typography gutterBottom style={{fontSize: '1.1rem', textAlign: 'center'}}>
                                      {cat.label}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                      <Grid container>
                        { this.props.search && serviceUsers.length>0 ?
                          <h3 style={{marginLeft: '15px', fontSize: '1.1rem', color: '#545659'}}>Nos meilleurs Alfred ...</h3>
                          :
                          null }
                          {/* Adresse spécifique  */
                          categories.map(cat => (
                            <Grid container>
                              {this.state.visibleCategories.includes(cat.label) ?
                                <Grid item xs={12}>
                                  <h3 style={{marginLeft:15}}>{cat.label}</h3>
                                </Grid> : null
                              }
                                <Grid container spacing={2} style={{marginLeft: 15, marginRight : 15, marginTop: 5}}>
                                {
                                   this.restrictServices(serviceUsers, cat).map(su => {
                                    return (
                                      <Grid item xs={12} sm={12} md={12} lg={3} xl={3}>
                                        <CardPreview services={su} alfred={user} gps={gps} needAvatar={true} key={moment()} />
                                      </Grid>
                                    )
                                  })
                                }
                                </Grid>
                                {this.state.visibleCategories.includes(cat.label) ?
                                  <Grid style={{display: 'flex', flexDirection: 'column', width: '100%', marginTop: 30, marginBottom: 30}}>
                                    <Grid style={{textAlign: 'center'}}>
                                      <img alt={"séparateur"} src={'../../../static/separateur-bleu.svg'} className={classes.separatorBlue}/>
                                    </Grid>
                                    { this.hasMoreToDisplay(serviceUsers, cat) ?
                                      <Grid style={{marginLeft: 15}}>
                                        <Button color={'primary'} onClick={()=>this.increaseCount(cat)}>Voir plus d'Alfred</Button>
                                      </Grid>
                                     : null
                                    }
                                  </Grid>
                                    : null}
                              </Grid>
                            ))}
                          </Grid>
                          {this.props.search && serviceUsers.length === 0 && !this.isSubFilterSet() ?
                            <p>Nous n'avons pas trouvé de résultat pour votre recherche</p>
                            :
                            null
                          }
                          {this.props.search && serviceUsers.length === 0 && this.isSubFilterSet() ?
                            <p><Button onClick={() => this.resetFilter()}>Aucun résultat, supprimer les filtres</Button></p> :  null
                          }
                 </Grid>
                { this.props.search || serviceUsers.length>0 ? null:
                  <>
                  <SerenityNeed gps={gps}/>
                  <BecomeAlfred />
                  <Section3 gps={gps}/>
                  <NearbyYou gps={gps}/>
                  <Profiteandlearn gps={gps}/>
                  <Section6 gps={gps}/>
                  <Wellbeing gps={gps}/>
                  <Section8 gps={gps}/>
                  <FeelingGood gps={gps}/>
                  <Section10 gps={gps}/>
                  <Proposeservice />
                  <Section12 gps={gps}/>
                  <NearbyYou gps={gps}/>
                  <Passions/>
                  <Section15 gps={gps}/>
                  <Section16 gps={gps}/>
                  <Facons/>
                  <Section18 gps={gps}/>
                  <Section19 gps={gps}/>
                  <Otter/>
                  <Section21 gps={gps}/>
                  <Section22 gps={gps}/>
                  <Assureback/>
                  </>
                }

                <Footer/>
              </Layout>
            </Fragment>
        )
    }
}


export default withStyles(styles)(SearchPage);
