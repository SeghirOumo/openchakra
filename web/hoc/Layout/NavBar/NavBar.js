const {setAxiosAuthentication} = require('../../../utils/authentication')
import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const {clearAuthenticationToken} = require('../../../utils/authentication')
import Router from 'next/router';
import Grid from '@material-ui/core/Grid';

import LogIn from '../../../components/LogIn/LogIn';
import Register from '../../../components/Register/Register';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AlgoliaPlaces from 'algolia-places-react';
import {SEARCHBAR, NAVBAR_MENU} from '../../../utils/i18n';
import DatePicker from "react-datepicker";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Link from '../../../components/Link/Link';
import axios from 'axios'
import Hidden from "@material-ui/core/Hidden";
import withStyles from "@material-ui/core/styles/withStyles";
import styles from '../../../static/css/components/NavBar/NavBar';
import {Typography} from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import InputLabel from '@material-ui/core/InputLabel';
import DialogActions from "@material-ui/core/DialogActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import {DateRangePicker} from "react-dates";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import ClearIcon from "@material-ui/icons/Clear";
import {is_development} from "../../../config/config";
import {is_b2b_site, is_b2b_admin} from "../../../utils/context";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogTitle = withStyles(styles)((props) => {
  const {children, classes, onClose, ...other} = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon/>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});


class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      setOpenLogin: false,
      setOpenRegister: false,
      user: null,
      activeStep: 0,
      keyword: '',
      city: undefined,
      gps: '',
      dateSelected: '',
      ifHomePage: false,
      modalMobileSearchBarInput: false,
      mobileStepSearch: 0,
      ifSearchPage: false,
      modalFilters: false,
      individualSelected: false,
      proSelected: false,
      startDate: null,
      endDate: null,
      focusedInput: null,
      b2b: false

    }
  }

  componentDidMount() {
    let query = Router.query;
    if (Router.pathname === '/') {
      this.setState({ifHomePage: true})
    }
    if (Router.pathname === '/search') {
      this.setState({ifSearchPage: true})
    }
    if (query.login === 'true') {
      this.handleOpenLogin()
    }

    setAxiosAuthentication()
    axios.get('/myAlfred/api/users/current')
      .then(res => {
        var allAddresses = {'main': res.data.billing_address};
        res.data.service_address.forEach(addr => {
          allAddresses[addr._id] = addr
        });

        this.setState({
          user: res.data,
          allAddresses: allAddresses
        })
      }).catch(err => {
      console.error(err)
    });

    this.setState({selectedAddress: this.props.selectedAddress || 'main', keyword: this.props.keyword || ''});
  }

  logout = () => {
    clearAuthenticationToken()
    localStorage.removeItem('path')
    if (this.state.ifHomePage) {
      window.location.reload(false)
    } else {
      Router.push('/')
    }
  };

  handleMenuClose = () => {
    this.setState({anchorEl: null});
  };

  handleOpenLogin = (e) => {
    this.handleMenuClose();
    this.setState({setOpenLogin: true, setOpenRegister: false});
  };

  handleCloseLogin = () => {
    this.setState({setOpenLogin: false});
  };

  handleOpenRegister = (e) => {
    this.handleMenuClose();
    this.setState({setOpenRegister: true, setOpenLogin: false});
  };

  handleCloseRegister = () => {
    if (this.state.activeStep === 2) {
      this.setState({setOpenRegister: false}, () => this.componentDidMount());
    } else {
      this.setState({setOpenRegister: false});
    }
  };

  needRefresh = () => {
    this.setState({setOpenLogin: false});
    const path = localStorage.getItem('path')
    if (path) {
      localStorage.removeItem('path');
      Router.push(path)
    } else {
      Router.push('/search?search=1');
    }
  };

  getData = (e) => {
    this.setState({activeStep: e});
  };

  onSuggestions = ({query}) => {
    this.setState({city: query});
  };

  onChange = e => {
    let {name, value} = e.target;
    this.setState({[name]: value});
    if (name === 'selectedAddress') {
      if (value === 'addAddress') {
        Router.push('/account/myAddresses');
      } else {
        this.setState({
          gps: value === 'all' ? null : value === 'main' ? this.state.allAddresses['main'].gps : {
            lat: this.state.allAddresses[value].lat,
            lng: this.state.allAddresses[value].lng,
          },
        });
      }
    }
  };

  handleOpenMenuItem = (event) => {
    this.setState({anchorEl: event.currentTarget})
  };

  handleClosenMenuItem = () => {
    this.setState({anchorEl: false})
  };

  b2bSide = () => {
    localStorage.setItem('b2b', 'true');
    window.location.reload();
  }
  cleanB2b = () => {
    localStorage.removeItem('b2b');
    window.location.reload();
  }
  findService = () => {
    var queryParams = {search: 1};
    if (this.state.keyword) {
      queryParams['keyword'] = this.state.keyword;
    }

    if (this.state.city) {
      queryParams['city'] = this.state.city;
    }

    if (this.state.gps) {
      queryParams['gps'] = JSON.stringify(this.state.gps);
    }

    if (this.state.selectedAddress) {
      queryParams['selectedAddress'] = this.state.selectedAddress
    }
    Router.push({pathname: '/search', query: queryParams});
  };

  onChangeCity({suggestion}) {
    this.setState({gps: suggestion.latlng, city: suggestion.name});
  };

  statusFilterChanged = event => {
    this.setState({[event.target.name]: event.target.checked, modalFilters: false}, () => this.props.filter());
  };

  onChangeInterval(startDate, endDate) {
    if (startDate) {
      startDate.hour(0).minute(0).second(0).millisecond(0);
    }

    if (endDate) {
      endDate.hour(23).minute(59).second(59).millisecond(999);
    }

    this.setState({startDate: startDate, endDate: endDate});
  }

  handleModalSearchBarInput = () => {
    this.setState({modalMobileSearchBarInput: true})
  };

  mobileSearchBarInput = (classes) => {
    return (
      <Grid className={this.state.ifHomePage ? classes.navbarSearchContainer : classes.navbarSearchContainerSearchP}
            onClick={this.handleModalSearchBarInput}>
        <Paper classes={{root: this.state.ifHomePage ? classes.navbarSearch : classes.navbarSearchP}}>
          <Grid>
            <IconButton classes={{root: classes.iconButton}} aria-label="search">
              <SearchIcon/>
            </IconButton>
          </Grid>
          <Grid style={{marginLeft: '2vh'}}>
            <Typography>Commencez votre recherche</Typography>
          </Grid>
        </Paper>
      </Grid>
    )
  };

  modalMobileSearchBarInput = (classes) => {
    return (
      <SwipeableDrawer
        anchor={'bottom'}
        open={this.state.modalMobileSearchBarInput}
        onOpen={() => this.setState({modalMobileSearchBarInput: true})}
        onClose={() => this.setState({
          modalMobileSearchBarInput: false,
          mobileStepSearch: 0,
          keyword: null,
          city: undefined,
          gps: ''
        })}
        className={classes.drawerStyle}
      >
        <Grid container style={{height: '100%'}}>
          <Grid item style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Grid>
              <IconButton
                aria-label="delete"
                classes={{root: classes.rootIconButton}}
                onClick={() => this.setState({
                  modalMobileSearchBarInput: false,
                  mobileStepSearch: 0,
                  keyword: null,
                  city: undefined,
                  gps: ''
                })}>
                <ClearIcon/>
              </IconButton>
            </Grid>
            <Grid>
              <h3
                style={{margin: 0}}>{this.state.mobileStepSearch === 0 ? 'Quel service recherchez-vous ?' : this.state.mobileStepSearch === 1 ? 'Où' : 'Dates'}</h3>
            </Grid>
          </Grid>
          <Grid item container spacing={3} style={{margin: 0}}>
            <Grid item xs={12} style={{display: 'flex', justifyContent: 'center', paddingBottom: 0, paddingTop: 0}}>
              {
                this.state.mobileStepSearch === 0 ?
                  <TextField
                    value={this.state.keyword}
                    onChange={this.onChange}
                    name={'keyword'}
                    label={'Ménage, jardinage, ...'}
                    onKeyPress={(e) => {
                      e.key === 'Enter' && e.preventDefault();
                    }}
                    variant="outlined"
                    classes={{root: classes.modalMobileSearchBarInputTextField}}
                  />
                  :
                  this.state.user ?
                    <Grid>
                      <FormControl variant="outlined">
                        <Select
                          id="outlined-select-currency"
                          value={this.state.selectedAddress || 'main'}
                          name={'selectedAddress'}
                          onChange={(e) => {
                            this.onChange(e);
                          }}
                          classes={{selectMenu: classes.fitlerMenuLogged}}
                        >
                          <MenuItem value={'main'} style={{whiteSpace: 'nowrap'}}>
                            Adresse
                            principale, {' ' + this.state.user.billing_address.address} {this.state.user.billing_address.zip_code},{this.state.user.billing_address.city}
                          </MenuItem>
                          {this.state.user.service_address.map((e, index) => (
                            <MenuItem value={e._id} key={index}>
                              {e.label + ', '} {' ' + e.address},{e.zip_code} {e.city}
                            </MenuItem>
                          ))}
                          <MenuItem value={'all'}>
                            Partout, Rechercher des Alfred partout
                          </MenuItem>
                          <MenuItem value={'addAddress'}>
                            <Typography style={{color: '#2FBCD3', cursor: 'pointer'}}>
                              Ajouter une adresse
                            </Typography>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    :
                    <TextField
                      item
                      xs={12}
                      classes={{root: classes.modalMobileSearchBartTextFieldWhereP}}
                      value={this.state.city}
                      label={SEARCHBAR.where}
                      variant={'outlined'}
                      InputProps={{
                        inputComponent: (inputRef) => {
                          return (
                            <AlgoliaPlaces
                              {...inputRef}
                              placeholder={''}
                              className={classes.navbarAlgoliaPlace}
                              options={{
                                appId: 'plKATRG826CP',
                                apiKey: 'dc50194119e4c4736a7c57350e9f32ec',
                                language: 'fr',
                                countries: ['fr'],
                                type: 'city',
                              }}
                              onChange={(suggestion) => this.onChangeCity(suggestion)}
                              onClear={() => this.setState({city: '', gps: ''})}

                            />)
                        },
                        disableUnderline: true
                      }}
                    />
              }
            </Grid>
          </Grid>
          <Grid item xs={12} style={{display: 'flex', justifyContent: 'center'}}>
            <Grid style={{width: '90%'}}>
              <Button
                onClick={() => this.state.mobileStepSearch === 0 ? this.setState({mobileStepSearch: this.state.mobileStepSearch + 1}) : this.findService()}
                color={'primary'} classes={{root: classes.buttonNextRoot}}
                variant={'contained'}>{this.state.mobileStepSearch === 0 ? 'Suivant' : 'Rechercher'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </SwipeableDrawer>
    )
  };

  mobileSearchBarInputSearchPage = (classes) => {
    return (
      <Grid className={classes.navbarSearchContainerSearchPage}>
        <Paper classes={{root: classes.navbarSearch}}>
          <Grid>
            <IconButton classes={{root: classes.iconButton}} aria-label="search"
                        onClick={this.handleModalSearchBarInput}>
              <SearchIcon/>
            </IconButton>
          </Grid>
          <Grid style={{
            marginLeft: '2vh',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            cursor: 'pointer'
          }} onClick={this.handleModalSearchBarInput}>
            <Typography style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>Commencez votre
              recherche</Typography>
          </Grid>
          <Grid style={{height: 30}}>
            <Divider style={{width: 2}} orientation="vertical"/>
          </Grid>
          <IconButton color="primary" aria-label="directions" onClick={() => this.setState({modalFilters: true})}>
            <TuneIcon/>
          </IconButton>
        </Paper>
      </Grid>
    )
  };

  modalMobileFilter = (classes) => {
    return (
      <Dialog
        onClose={() => this.setState({modalFilters: false})}
        aria-labelledby="customized-dialog-title"
        open={this.state.modalFilters}
        classes={{paper: classes.dialogNavbarMobileFilter}}
      >
        <DialogTitle id="customized-dialog-title" onClose={() => this.setState({modalFilters: false})}>
          Filtres
        </DialogTitle>
        <DialogContent dividers>
          <Grid>
            <Grid>
              <Grid>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.proSelected}
                      onChange={e => {
                        this.statusFilterChanged(e);
                      }}
                      value={this.state.proSelected}
                      color="primary"
                      name={'proSelected'}
                    />
                  }
                  label="Pro"
                />
              </Grid>
              <Grid>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.individualSelected}
                      onChange={e => {
                        this.statusFilterChanged(e);
                      }}
                      value={this.state.individualSelected}
                      color="primary"
                      name={'individualSelected'}
                    />
                  }
                  label="Particulier"
                />
              </Grid>
            </Grid>
            <Grid>
              <Divider style={{width: '100%', marginTop: '2vh', marginBottom: '2vh'}}/>
            </Grid>
            <Grid>
              <DateRangePicker
                startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                startDatePlaceholderText={'Début'}
                endDatePlaceholderText={'Fin'}
                startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                onDatesChange={({startDate, endDate}) => this.onChangeInterval(startDate, endDate)} // PropTypes.func.isRequired,
                focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                onFocusChange={focusedInput => this.setState({focusedInput})} // PropTypes.func.isRequired,
                minimumNights={0}
                numberOfMonths={1}
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => this.setState({modalFilters: false}, () => this.props.filter())}
            color="primary"
          >
            Afficher les résultats
          </Button>
        </DialogActions>
      </Dialog>
    )
  };


  searchBarInput = (classes) => {

    const logged = this.state.user != null
    return (
      <Grid className={this.state.ifHomePage ? classes.navbarSearchContainer : classes.navbarSearchContainerSearchP}>
        <Paper classes={{root: this.state.ifHomePage ? classes.navbarSearch : classes.navbarSearchP}}>
          <Grid className={classes.navbarTextFieldService}>
            <TextField
              classes={{root: this.state.ifHomePage ? classes.navbarRootTextField : classes.navbarRootTextFieldP}}
              placeholder={'Ménage, Jardinage, ...'}
              value={this.state.keyword}
              onChange={this.onChange}
              name={'keyword'}
              label={this.state.ifHomePage ? SEARCHBAR.labelWhat : null}
              onKeyPress={(e) => {
                e.key === 'Enter' && e.preventDefault();
              }}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{disableUnderline: true}}
              style={{marginLeft: 20}}
            />
          </Grid>
          <Grid>
            <Divider className={classes.divider} orientation="vertical"/>
          </Grid>
          {this.state.user ?
            <Grid className={classes.navbarAddressContainer}>
              <FormControl className={classes.navbarFormControlAddress}>
                {this.state.ifHomePage ?
                  <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                    L'Adresse
                  </InputLabel> : null
                }
                <Select
                  disableUnderline
                  id="outlined-select-currency"
                  value={this.state.selectedAddress || 'main'}
                  name={'selectedAddress'}
                  onChange={(e) => {
                    this.onChange(e);
                  }}
                  classes={{root: classes.selectRoot}}
                >
                  <MenuItem value={'main'}>
                    Adresse
                    principale, {' ' + this.state.user.billing_address.address} {this.state.user.billing_address.zip_code},{this.state.user.billing_address.city}
                  </MenuItem>
                  {this.state.user.service_address.map((e, index) => (
                    <MenuItem value={e._id} key={index}>
                      {e.label + ', '} {' ' + e.address},{e.zip_code} {e.city}
                    </MenuItem>
                  ))}
                  <MenuItem value={'all'}>
                    Partout, Rechercher des Alfred partout
                  </MenuItem>
                  <MenuItem value={'addAddress'}>
                    <Typography style={{color: '#2FBCD3', cursor: 'pointer'}}>
                      Ajouter une adresse
                    </Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            :
            <Grid className={this.state.ifHomePage ? classes.navbarAlgoliaContent : classes.navbarAlgoliaContentP}>
              <TextField
                label={this.state.ifHomePage ? SEARCHBAR.labelWhere : false}
                classes={{root: this.state.ifHomePage ? classes.navbarRootTextFieldWhere : classes.navbarRootTextFieldWhereP}}
                InputLabelProps={{shrink: true}}
                value={this.state.city}
                InputProps={{
                  inputComponent: (inputRef) => {
                    return (
                      <AlgoliaPlaces
                        {...inputRef}
                        placeholder={SEARCHBAR.where}
                        className={classes.navbarAlgoliaPlace}
                        options={{
                          appId: 'plKATRG826CP',
                          apiKey: 'dc50194119e4c4736a7c57350e9f32ec',
                          language: 'fr',
                          countries: ['fr'],
                          type: 'city',
                        }}
                        onChange={(suggestion) => this.onChangeCity(suggestion)}
                        onClear={() => this.setState({city: '', gps: null})}
                      />)
                  },
                  disableUnderline: true
                }}
              />
            </Grid>
          }
          {
            logged === false && this.state.ifHomePage ?
              <Grid className={classes.navbarDatePickerMain}>
                <Grid>
                  <Divider className={classes.divider} orientation="vertical"/>
                </Grid>
                <Grid
                  className={this.state.ifHomePage ? classes.navbarDatePickerContainer : classes.navbarDatePickerContainerP}>
                  <TextField
                    label={this.state.ifHomePage ? SEARCHBAR.labelWhen : false}
                    classes={{root: this.state.ifHomePage ? classes.navbarRootTextFieldWhen : classes.navbarRootTextFieldWhenP}}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      inputComponent: (inputRef) => {
                        return (
                          <DatePicker
                            {...inputRef}
                            selected={this.state.dateSelected}
                            onChange={(date) => {
                              this.setState({dateSelected: date});
                              if (date === null) {
                                this.setState({dateSelected: ''});
                              }
                            }}
                            locale='fr'
                            showMonthDropdown
                            dateFormat="dd/MM/yyyy"
                            placeholderText={SEARCHBAR.when}
                            minDate={new Date()}
                            className={this.state.ifHomePage ? classes.inputDatePicker : classes.inputDatePickerP}
                          />)
                      },
                      disableUnderline: true
                    }}
                  />
                </Grid>
              </Grid> : null
          }
          <Grid>
            <IconButton
              classes={{root: classes.iconButton}}
              aria-label="search"
              onClick={() => this.findService()}>
              <SearchIcon/>
            </IconButton>
          </Grid>
        </Paper>
      </Grid>
    )
  };

  render() {
    const {user, setOpenLogin, setOpenRegister, anchorEl, ifHomePage, modalMobileSearchBarInput, ifSearchPage, modalFilters, business} = this.state;
    const {classes} = this.props;


    const logged = user != null
    const modalLogin = () => {
      return (
        <LogIn callRegister={this.handleOpenRegister} login={this.needRefresh} id={'connect'}/>
      );
    };

    const modalRegister = () => {
      return (
        <Register callLogin={this.handleOpenLogin} sendParentData={this.getData} id={'register'}/>
      );
    };

    return (
      <Grid className={this.state.ifHomePage ? classes.navbarMainSytle : classes.navbarMainSytleP}>
        <AppBar position={'static'} className={this.state.ifHomePage ? classes.navbarAppBar : classes.navbarAppBarP}>
          <Toolbar classes={{root: this.state.ifHomePage ? classes.navBartoolbar : classes.navBartoolbarP}}>
            <Hidden only={['xs']}>
              <Grid className={this.state.ifHomePage ? classes.navbarTopContainer : classes.navbarTopContainerP}>
                <Grid className={ifHomePage ? classes.navbarLogoContainer : classes.navbarLogoContainerP}
                      onClick={() => Router.push('/')}>
                  <img alt={'logo_myAlfred'} title={'logo_myAlfred'} src={'../../../static/assets/icon/logo.svg'}
                       className={classes.logoMyAlfred} height={64} style={{filter: 'invert(1)'}}/>
                </Grid>
                {
                  ifHomePage ?
                    <Grid className={ifHomePage ? classes.navabarHomepageMenu : classes.navabarHomepageMenuP}>
                      <Tabs value={false} aria-label="simple tabs example">
                        <Link href={'/search?search=1'}>
                          <Tab classes={{root: classes.navbarTabRoot}}
                               label={NAVBAR_MENU.ourServices}/>
                        </Link>
                        {user ?
                          user.is_alfred ?
                            <Link href={`/profile/services?user=${user._id}`}>
                              <Tab classes={{root: classes.navbarTabRoot}}
                                   label={NAVBAR_MENU.myServices}/>
                            </Link>
                            :
                            <Link href={'/creaShop/creaShop'}>
                              <Tab classes={{root: classes.navbarTabRoot}}
                                   label={NAVBAR_MENU.registerServices}/>
                            </Link>
                          :
                          <Link onClick={this.handleOpenRegister}>
                            <Tab classes={{root: classes.navbarTabRoot}}
                                 label={NAVBAR_MENU.registerServices}/>
                          </Link>
                        }
                        {
                          !is_b2b_site() ?
                            <Link href={'/'} onClick={this.b2bSide}>
                              <Tab classes={{root: classes.navbarTabRoot}}
                                   label={NAVBAR_MENU.businessSide}/>
                            </Link> : is_development() ?
                            <Link href={'/'} onClick={this.cleanB2b}>
                              <Tab classes={{root: classes.navbarTabRoot}}
                                   label={'Retour Alfred Particuliers'}/>
                            </Link> : null

                        }
                      </Tabs>
                    </Grid> : this.searchBarInput(classes)
                }
                {
                  logged === true ?
                    <Grid
                      className={ifHomePage ? classes.navbarMenuBurgerContainer : classes.navbarMenuBurgerContainerP}>
                      <IconButton
                        aria-label="open drawer"
                        onClick={this.handleOpenMenuItem}
                      >
                        <MenuIcon style={{color: 'white'}}/>
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={this.handleClosenMenuItem}
                        getContentAnchorEl={null}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                        transformOrigin={{vertical: 'top', horizontal: 'center'}}
                      >
                        {user ?
                          <Grid>
                            <MenuItem>Bonjour {user.firstname} !</MenuItem>
                            {
                              !user.is_employee ?

                                <Link href={`/profile/about?user=${user._id}`}>
                                  <MenuItem>Mon profil</MenuItem>
                                </Link> : null}
                            <Link href={is_b2b_admin(user) ? '/account/editProfileCompany' : '/account/editProfile'}>
                              <MenuItem>Mes paramètres</MenuItem>
                            </Link>
                            {
                              !user.is_employee ?
                                user.is_alfred ?
                                  <Link href={`/profile/services?user=${user._id}`}>
                                    <MenuItem>Mes services</MenuItem>
                                  </Link>
                                  :
                                  <Link href={`/creaShop/creaShop`}>
                                    <MenuItem>Proposer mes services</MenuItem>
                                  </Link> : null
                            }

                            <Link href={`/profile/messages?user=${user._id}`}>
                              <MenuItem>Mes messages</MenuItem>
                            </Link>
                            <Link href={`/reservations/reservations`}>
                              <MenuItem>Mes réservations</MenuItem>
                            </Link>
                            {user.is_admin ?
                              <Link href={`/dashboard/home`}>
                                <MenuItem>Dashboard</MenuItem>
                              </Link> : null
                            }
                            <MenuItem onClick={this.logout}>Déconnexion</MenuItem>
                          </Grid>
                          :
                          null
                        }
                      </Menu>
                    </Grid>
                    :
                    <Grid className={ifHomePage ? classes.navbarButtonContainer : classes.navbarButtonContainerP}>
                      <Grid>
                        <Button
                          className={classes.navBarlogIn}
                          onClick={this.handleOpenLogin}>
                          {NAVBAR_MENU.logIn}
                        </Button>
                        <Dialog
                          scroll={'paper'}
                          aria-labelledby="scroll-dialog-title"
                          aria-describedby="scroll-dialog-description"
                          className={classes.navbarModal}
                          open={setOpenLogin}
                          onClose={this.handleCloseLogin}
                          TransitionComponent={Transition}
                          classes={{paperWidthSm: classes.navbarPaperWidth}}
                          disableBackdropClick={true}
                          disableEscapeKeyDown={true}
                        >
                          <DialogTitle id="customized-dialog-title" onClose={this.handleCloseLogin}/>
                          <DialogContent classes={{root: classes.navbarWidthLoginContent}}>
                            <div className={classes.navbarPaper}>
                              {modalLogin()}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Grid>
                      <Grid className={classes.navbarRegisterContainer}>
                        <Button
                          variant="outlined"
                          classes={{root: classes.navbarSignIn}}
                          onClick={this.handleOpenRegister}>
                          {NAVBAR_MENU.signIn}
                        </Button>
                        <Dialog
                          scroll={'paper'}
                          aria-labelledby="scroll-dialog-title"
                          aria-describedby="scroll-dialog-description"
                          className={classes.navbarModal}
                          open={setOpenRegister}
                          onClose={this.handleCloseRegister}
                          TransitionComponent={Transition}
                          disableBackdropClick={true}
                          disableEscapeKeyDown={true}
                        >
                          <DialogTitle id="customized-dialog-title" onClose={this.handleCloseRegister}/>
                          <DialogContent dividers={false} className={classes.navbarMuidialogContent}>
                            <div className={classes.navbarPaper}>
                              {modalRegister()}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Grid>
                    </Grid>
                }
              </Grid>
              {
                ifHomePage ? this.searchBarInput(classes) : null
              }
            </Hidden>
            <Hidden only={['sm', 'md', 'lg', 'xl']}>
              {ifHomePage ? this.mobileSearchBarInput(classes) : null}
              {ifSearchPage ? this.mobileSearchBarInputSearchPage(classes) : null}
            </Hidden>
          </Toolbar>
        </AppBar>
        {modalMobileSearchBarInput ? this.modalMobileSearchBarInput(classes) : null}
        {modalFilters ? this.modalMobileFilter(classes) : null}
      </Grid>
    )
  }
}

export default withStyles(styles)(NavBar);
