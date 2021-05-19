const {setAxiosAuthentication} = require('../../utils/authentication')
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import {withStyles} from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import axios from 'axios';
import styles from './UserAvatarStyle';
import {isEditableUser} from '../../utils/functions'

const {getLoggedUserId} = require('../../utils/functions')
import Typography from "@material-ui/core/Typography";
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

const jwt = require('jsonwebtoken');

class UserAvatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      currentUser: '',
      kyc: null,
      owner: false,
      userId: '',
    };
    this.interval_id = null;
  }

  componentDidMount() {
    const user_id = getLoggedUserId()
    if (user_id) {
      this.setState({currentUser: user_id},
        () => {
          // Check once then every 20s
          if (this.props.warnings === true) {
            this.checkWarnings(token);
            this.interval_id = setInterval(() => this.checkWarnings(token), 20000);
          }
        },
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval_id);
  }

  checkWarnings = token => {
    setAxiosAuthentication()
    var kyc = [];
    axios.get('/myAlfred/api/chatRooms/nonViewedMessagesCount')
      .then(res => {
        const nbMessages = res.data;
        if (nbMessages > 0) {
          const plural = nbMessages === 1 ? '' : 's';
          kyc.push(`Vous avez ${res.data} message${plural} non lu${plural}`);
        }
        return axios.get('/myAlfred/api/users/current');
      })
      .then(res => {
        const user = res.data;
        if (user.id_card_error_text) {
          kyc.push(user.id_card_error_text);
        }
      })
      .then(() => {
        this.setState({kyc: kyc.length > 0 ? kyc : null});
      })
      .catch(err => console.error(err));
  };

  ifOwner() {
    if (this.state.currentUser === this.state.userId) {
      this.setState({owner: true});
    }
  };

  handlePopoverOpen = (event) => {
    this.setState({anchorEl: event.currentTarget});
  };

  handlePopoverClose = () => {
    this.setState({anchorEl: null});
  };

  selectPicture = () => {
    if (isEditableUser(this.props.user)) {
      this.fileInput.click()
    }
  };

  avatarWithPics(user, className) {
    const url = user.picture.match(/^https?:\/\//) ? user.picture : '/' + user.picture;
    return (
      <Avatar alt="photo de profil" src={url} className={className} onClick={this.selectPicture}>
      </Avatar>
    );
  }

  avatarWithoutPics(user, className) {
    return (
      <Avatar alt="photo de profil" className={className}
              onClick={this.selectPicture}>
        <p>{user.avatar_letters}</p>
      </Avatar>
    );
  }


  onChange = event => {
    const newPicture = event.target.files[0];
    const formData = new FormData();
    formData.append('myImage', newPicture);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    axios.post('/myAlfred/api/users/profile/picture', formData, config)
      .then(response => {
        // TODO: reload only avatar using setState
        window.location.reload(false)
      }).catch();

  }

  render() {
    const {user, className, classes} = this.props;
    const {anchorEl, currentUser} = this.state;
    const open = Boolean(anchorEl);

    if (user) {
      var owner = currentUser === user._id;
      var kyc = this.state.kyc;
    }

    if (user) {
      return (
        <Grid style={{width: '100%', height: '100%'}}>
          {
            owner && kyc ?
              <Grid>
                <Badge
                  classes={{badge: classes.badge}}
                  overlap="circle"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                  onMouseEnter={this.handlePopoverOpen}
                  onMouseLeave={this.handlePopoverClose}
                  aria-owns={anchorEl ? 'mouse-over-popover' : undefined}
                  aria-haspopup="true"
                >
                  {
                    user.picture ?
                      this.avatarWithPics(user, className)
                      :
                      this.avatarWithoutPics(user, className)
                  }
                </Badge>
                <input
                  id="file"
                  ref={fileInput => this.fileInput = fileInput}
                  style={{display: 'none'}}
                  name="myImage"
                  type="file"
                  onChange={this.onChange}
                  className="form-control"
                  accept={'image/*'}
                />

                <Popover
                  id="mouse-over-popover"
                  className={classes.popover}
                  classes={{
                    paper: classes.paper,
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={this.handlePopoverClose}
                  disableRestoreFocus
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <ul>
                    {
                      kyc.map(res => (
                        <li>{res}</li>
                      ))
                    }
                  </ul>
                </Popover>

              </Grid> :
              <Grid style={{
                display: 'flex',
                justifyContent: 'center',
                height: '100%',
                alignItems: 'center',
                width: '100%'
              }}>
                {
                  user.picture ?
                    this.avatarWithPics(user, className)
                    :
                    this.avatarWithoutPics(user, className)
                }
                <input
                  id="file"
                  ref={fileInput => this.fileInput = fileInput}
                  style={{display: 'none'}}
                  name="myImage"
                  type="file"
                  onChange={this.onChange}
                  className="form-control"
                  accept={'image/*'}
                />
              </Grid>
          }
          {
            owner ?
              <PhotoCameraIcon style={{
                float: 'right',
                bottom: '40%',
                zIndex: '2',
                position: 'relative',
                color: '#312b2a',
                backgroundColor: '#BDBDBD',
                borderRadius: '50%',
                padding: '0.3vh',
                border: 'white 0.5px solid',
                fontSize: 30
              }} onClick={this.selectPicture}/> : null
          }


        </Grid>
      );

    } else {
      return (
        <Grid>
          <Avatar alt="photo de profil" src='/static/basicavatar.png' className={className}/>
        </Grid>
      );
    }

  }
}

export default withStyles(styles)(UserAvatar);
