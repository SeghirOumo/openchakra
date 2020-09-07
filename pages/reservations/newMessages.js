import React, {Fragment} from 'react';
import Link from 'next/link';
import Layout from '../../hoc/Layout/Layout';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import styles from './newMessages/newMessagesStyle';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import NavbarMobile from '../../components/NavbarMobile/NavbarMobile';
import UserAvatar from '../../components/Avatar/UserAvatar';
import Button from '@material-ui/core/Button';
import NavBarShop from '../../components/NavBar/NavBarShop/NavBarShop';
import ResponsiveDrawer from '../../components/ResponsiveDrawer/ResponsiveDrawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import cookie from 'react-cookies';

class NewMessages extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      idEmitter: '',
      chatrooms: [],
      tabs: false,
      alfredReservations: [],
      userReservations: [],
      isAlfred: false,
    };
    this.callDrawer = this.callDrawer.bind(this);
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = cookie.load('token');

    axios.get('/myAlfred/api/users/current').then(res => {
      this.setState({idEmitter: res.data._id});
      if (res.data.is_alfred === true) {
        this.setState({isAlfred: true});
      }
    });

    axios.get('/myAlfred/api/chatRooms/nonViewedMessages')
      .then(res => {
        this.setState({
          alfredReservations: res.data[0],
          userReservations: res.data[1],
        });
      });


    axios
      .get('/myAlfred/api/chatRooms/userChatRooms')
      .then(res => {
        this.setState({chatrooms: res.data});
      });
  }

  handleClicktabs2 = () => {
    this.setState({tabs: true});
  };

  handleClicktabs = () => {
    this.setState({tabs: false});
  };

  callDrawer() {
    this.child.current.handleDrawerToggle();
  }

  render() {
    const {classes} = this.props;
    const {isAlfred} = this.state;
    const tabs = this.state.tabs;

    const nbNew = this.state.alfredReservations.length + this.state.userReservations.length;
    const msgTitle =
      nbNew == 0 ? 'Vous n\'avez aucun nouveau message'
        : nbNew == 1 ? 'Vous avez 1 nouveau message'
        : `Vous avez ${nbNew} nouveaux messages`;
    return (
      <Fragment>
        <Layout>
          <Grid container className={classes.bigContainer}>
            {isAlfred ?
              <Grid className={classes.navbarShopContainer}>
                <NavBarShop userId={this.state.idEmitter}/>
              </Grid>
              : null}


            {/*/////////////////////////////////////////////////////////////////////////////////////////*/}

            <Grid container>
              <Grid className={classes.toggle}>
                <Grid>
                  <ResponsiveDrawer ref={this.child} isActiveIndex={1} itemsDrawers={'message'} needMargin={true}/>
                </Grid>
                <Grid>
                  <Grid>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={this.callDrawer}
                      className={classes.menuButton}
                    >
                      <MenuIcon/>
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid style={{paddingLeft: 55}} item xs={9} sm={9} md={7}>
                <Typography style={{fontSize: '2rem', marginTop: '4%'}}>
                  Mes messages non lus
                </Typography>
                <Typography style={{fontSize: '0.8rem', marginBottom: '4%'}}>
                  {msgTitle}
                </Typography>

                {isAlfred ?
                  <Grid container className={classes.tabweb}>
                    <Grid item xs={6} style={{textAlign: 'center'}}>
                      <Grid>
                        <h2 className={classes.h2Style} onClick={this.handleClicktabs}>
                          En tant qu'Alfred
                        </h2>
                      </Grid>
                    </Grid>
                    <Grid item xs={6} style={{textAlign: 'center'}}>
                      <h2 onClick={this.handleClicktabs2} className={classes.h2Style}>
                        {' '}
                        En tant qu'utilisateur
                      </h2>
                      <br/>
                    </Grid>

                    <Grid item xs={6}>
                      {tabs ? (
                        <React.Fragment>
                          <hr className={classes.trait1} style={{marginTop: '-25px'}}/>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <hr className={classes.trait3} style={{marginTop: '-25px'}}/>
                        </React.Fragment>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      {tabs ? (
                        <React.Fragment>
                          <hr className={classes.trait} style={{marginTop: '-25px'}}/>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <hr className={classes.trait2} style={{marginTop: '-25px'}}/>
                        </React.Fragment>
                      )}
                    </Grid>
                  </Grid> : null
                }
                {
                  isAlfred ?
                    <Grid container className={classes.tabmobile}>
                      <Grid item xs={6} style={{textAlign: 'center'}}>
                        <h2 onClick={this.handleClicktabs} className={classes.h2StyleBis}>
                          En tant qu'Alfred
                        </h2>
                      </Grid>
                      <Grid item xs={6} style={{textAlign: 'center'}}>
                        <h2 className={classes.h2StyleBis} onClick={this.handleClicktabs2}>
                          En tant qu'utilisateur
                        </h2>
                        <br/>
                      </Grid>

                      <Grid item xs={6} style={{textAlign: 'center'}}>
                        {tabs ? (
                          <React.Fragment>
                            <hr className={classes.trait1}/>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <hr className={classes.trait3}/>
                          </React.Fragment>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {tabs ? (
                          <React.Fragment>
                            <hr className={classes.trait}/>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <hr className={classes.trait2}/>
                          </React.Fragment>
                        )}
                      </Grid>
                    </Grid> : null

                }
                {tabs ? (
                  this.state.userReservations.length ? (
                    this.state.userReservations.map(chatroom => {
                      return (
                        <React.Fragment>
                          {/* Web */}
                          <Grid alt={chatroom.name} container className={classes.webrow}>
                            <Grid item xs={2} md={1} className={classes.avatarContainer}>
                              <UserAvatar user={chatroom.booking.alfred}/>
                            </Grid>
                            <Grid item xs={5} md={6} className={classes.descriptionContainer}>
                              <Grid>
                                <Typography style={{marginTop: '2%', fontSize: '0.8rem', color: '#419F41'}}>
                                  {chatroom.booking.status} -{' '}
                                  {chatroom.recipient.firstname}
                                </Typography>
                              </Grid>
                              <Grid>
                                <Typography style={{color: 'black', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                  {typeof _.last(chatroom.messages) !== 'undefined' ? _.last(chatroom.messages).content : null}
                                </Typography>
                              </Grid>
                              <Grid>
                                <Typography style={{color: '#9B9B9B', fontSize: '0.8rem'}}>
                                  {typeof _.last(chatroom.messages) !== 'undefined' ? moment(_.last(chatroom.messages).date).format('DD/MM/YYYY') : null} - {typeof _.last(chatroom.messages) !== 'undefined' ? moment(_.last(chatroom.messages).date).format('HH:mm') : null}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Grid>
                                <Link href={{
                                  pathname: '/reservations/messagesDetails',
                                  query: {id: chatroom._id, booking: chatroom.booking._id},
                                }}>
                                  <Button color={'primary'} variant={'outlined'}>Voir</Button>
                                </Link>
                              </Grid>
                            </Grid>
                            <hr className={classes.hrSeparator}/>
                          </Grid>

                          {/* Mobile */}
                          <Grid alt={chatroom.name} container className={classes.mobilerow1}>
                            <Grid item xs={12} className={classes.containerUserAvatar}>
                              <UserAvatar user={chatroom.booking.alfred}/>
                            </Grid>
                            <Grid item xs={12} style={{textAlign: 'center', fontSize: '0.8rem'}}>
                              <Typography style={{marginTop: '2%', color: '#419F41', fontSize: '0.8rem'}}>
                                {chatroom.booking.status} -{' '}
                                {chatroom.recipient.firstname}
                              </Typography>
                              <Typography style={{color: 'black', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                {typeof _.last(chatroom.messages) !== 'undefined' ? _.last(chatroom.messages).content : null}
                              </Typography>
                              <Typography style={{color: '#9B9B9B', fontSize: '0.8rem'}}>
                                {typeof _.last(chatroom.messages) !== 'undefined' ? moment(_.last(chatroom.messages).date).format('DD/MM/YYYY') : null} - {typeof _.last(chatroom.messages) !== 'undefined' ? moment(_.last(chatroom.messages).date).format('HH:mm') : null}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Link
                                href={{
                                  pathname: '/reservations/messagesDetails',
                                  query: {
                                    id: chatroom._id,
                                    booking: chatroom.booking._id,
                                  },
                                }}
                              >
                                <Typography className={classes.buttonSee}>
                                  <a className={classes.noTextDecoration}>Voir</a>
                                </Typography>
                              </Link>
                            </Grid>
                          </Grid>
                        </React.Fragment>
                      );
                    })
                  ) : <p>Vous n'avez aucun nouveau message en tant qu'utilisateur</p>
                ) : (
                  <React.Fragment>
                    {this.state.alfredReservations.length
                      ? this.state.alfredReservations.map(chatroom => {
                        return (
                          <React.Fragment>

                            {/* Web */}
                            <Grid alt={chatroom.name} container className={classes.webrow}>
                              <Grid item xs={2} md={1} className={classes.avatarContainer}>
                                <UserAvatar user={chatroom.booking.alfred}/>
                              </Grid>
                              <Grid item xs={5} md={6} className={classes.descriptionContainer}>
                                <Grid>
                                  <Typography
                                    style={{marginTop: '2%', color: '#419F41', fontSize: '0.8rem'}}
                                  >
                                    {chatroom.booking.status} -{' '}
                                    {chatroom.recipient.firstname}
                                  </Typography>
                                </Grid>
                                <Grid>
                                  <Typography style={{color: 'black', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                    {_.last(chatroom.messages).content}
                                  </Typography>
                                </Grid>
                                <Grid>
                                  <Typography style={{color: '#9B9B9B', fontSize: '0.8rem'}}>
                                    {moment(_.last(chatroom.messages).date).format('DD/MM/YYYY')} - {moment(_.last(chatroom.messages).date).format('HH:mm')}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Grid item>
                                <Grid>
                                  <Link href={{
                                    pathname: '/reservations/messagesDetails',
                                    query: {id: chatroom._id, booking: chatroom.booking._id},
                                  }}>
                                    <Button color={'primary'} variant={'outlined'}>Voir</Button>
                                  </Link>
                                </Grid>
                              </Grid>
                              <hr className={classes.hrSeparator}/>
                            </Grid>


                            {/* Mobile */}
                            <Grid alt={chatroom.name} container className={classes.mobilerow1}>
                              <Grid item xs={12} className={classes.containerUserAvatar}>
                                <UserAvatar user={chatroom.booking.user}/>
                              </Grid>
                              <Grid item xs={12} style={{textAlign: 'center', fontSize: '0.8rem'}}>
                                <Typography style={{marginTop: '2%', color: '#419F41', fontSize: '0.8rem'}}>
                                  {chatroom.booking.status} -{' '}
                                  {chatroom.recipient.firstname}
                                </Typography>
                                <Typography style={{color: 'black', fontSize: '0.8rem', fontWeight: 'bold'}}>
                                  {_.last(chatroom.messages).content}
                                </Typography>
                                <Typography style={{color: '#9B9B9B', fontSize: '0.8rem'}}>
                                  {moment(_.last(chatroom.messages).date).format('DD/MM/YYYY')} - {moment(_.last(chatroom.messages).date).format('HH:mm')}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Link
                                  href={{
                                    pathname: '/reservations/messagesDetails',
                                    query: {
                                      id: chatroom._id,
                                      booking: chatroom.booking._id,
                                    },
                                  }}
                                >
                                  <Typography className={classes.buttonSee}>
                                    <a style={{textDecoration: 'none', color: 'white'}}>Voir</a>
                                  </Typography>
                                </Link>
                              </Grid>
                            </Grid>
                          </React.Fragment>
                        );
                      })
                      : <p>Vous n'avez aucun nouveau message en tant qu'Alfred</p>}
                  </React.Fragment>
                )}
              </Grid>
            </Grid>

            {/*/////////////////////////////////////////////////////////////////////////////////////////*/}
          </Grid>
        </Layout>
        {this.state.isAlfred ?
          <NavbarMobile userId={this.state.userId}/>
          : null}
      </Fragment>
    );
  }
}

export default withStyles(styles)(NewMessages);
