import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './CardPreviewStyle'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import RoomIcon from '@material-ui/icons/Room';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Link from 'next/link';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import axios from 'axios';
import { toast } from 'react-toastify';

const { config } = require('../../config/config');
const url = config.apiUrl;

class CardPreview extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      value:0,
      dense: true,
      service: [],
      alfred:[],
      shop:[],
      open: false,
      id_service: '',
      page: false,
    }
  }

  handleClickOpen(id) {
    this.setState({id_service: id, open:true});
  }

  handleClose() {
    this.setState({id_service:'', open:false});
  }

  deleteService(id) {
    axios.delete(url + 'myAlfred/api/serviceUser/' + id)
      .then(() => {
        toast.error('Service supprimé');
        this.setState({open:false,id_service:''});
        this.props.needRefresh();
      })
      .catch(err => console.log(err))
  }

  render(){
    const {classes, service, shop, services, userState, isOwner, alfred} = this.props;
    console.log(services, "services")

    const StyledRating = withStyles({
      iconFilled: {
        color: '#4fbdd7',
      },
    })(Rating);

    return (
      <Grid>
        <Card className={classes.card}>
          <Grid className={classes.cardMedia} style={{ backgroundImage:  'url("' + service.picture + '")'}}>
            { shop.is_professional ?
              <Grid className={classes.statusMedia}>
                <Chip label="PRO" className={classes.chipStyle}/>
              </Grid>
              :null
            }
            {userState && isOwner ?
              <Grid>
                <Grid className={classes.actionMediaEdit}>
                  { false ?
                  <IconButton aria-label="Edit" className={classes.iconButtonStyle}>
                    <EditIcon style={{color: '#4fbdd7'}}/>
                  </IconButton> : true
                  }
                </Grid>
                <Grid className={classes.actionMediaRemove}>
                  <IconButton aria-label="remove" className={classes.iconButtonStyle}>
                    <DeleteForeverIcon onClick={()=>this.handleClickOpen(services._id)} style={{color: '#f87280'}}/>
                  </IconButton>
                </Grid>
              </Grid>
              : null
            }
          </Grid>
          <CardContent>
            <Grid  className={classes.cardContent}>
              <Grid className={classes.cardContentPosition}>
                <Typography variant="body2" color="textSecondary" component="p" className={classes.sizeText}>
                  {service.category.label}
                </Typography>
                <Grid className={classes.cardContentHeader}>
                  <Typography component="p" className={classes.sizeText}>
                    {service.label}
                  </Typography>
                </Grid>
                <Box component="fieldset" mb={3} borderColor="transparent" className={classes.boxRating}>
                  <Badge badgeContent={0} color={'primary'} className={classes.badgeStyle}>
                    <StyledRating name="read-only" value={this.state.value} readOnly className={classes.rating} />
                  </Badge>
                </Box>
              </Grid>
              <Grid className={classes.cardContentRight}>
                <Grid className={classes.flexPosition}>
                  <Typography variant="body2" color="textSecondary" component="p" className={classes.sizeText}>
                    {alfred.billing_address.city}
                  </Typography>
                  <RoomIcon className={classes.checkCircleIcon}/>
                </Grid>
                <Button variant="contained" color="primary" className={classes.button} disabled={true}>
                  Visualiser
                </Button>
              </Grid>
            </Grid>
            <Grid className={classes.responsiveListContainer}>
              <List dense={this.state.dense} className={classes.flexPosition}>
                <ListItem className={classes.noPadding}>
                  <ListItemIcon className={classes.minWidth}>
                    <img src={services.graduated && services.graduated !== "" && services.graduated !== null && services.graduated !== undefined ? '../../static/assets/img/iconCardAlfred/graduated.svg' : '../../static/assets/img/iconCardAlfred/no_graduated.svg'} alt={'Diplome'} title={'Diplome'} className={classes.imageStyle}/>
                  </ListItemIcon>
                  <ListItemText
                    classes={{primary:classes.sizeText}}
                    primary={"Diplômé(e)"}
                  />
                </ListItem>
                <ListItem className={classes.noPadding}>
                  <ListItemIcon  className={classes.minWidth}>
                    <img src={services.is_certified && services.is_certified !== "" && services.is_certified !== null && services.is_certified !== undefined ? '../../static/assets/img/iconCardAlfred/certificate.svg' : '../../static/assets/img/iconCardAlfred/no_certificate.svg'} alt={'Certifié'} title={'Certifié'} className={classes.imageStyle}/>
                  </ListItemIcon>
                  <ListItemText
                    classes={{primary:classes.sizeText}}
                    primary="Certifié(e)"
                  />
                </ListItem>
                <ListItem className={classes.noPadding}>
                  <ListItemIcon className={classes.minWidth}>
                    <img src={services.level && services.level !== "" && services.level !== null && services.level !== undefined ? '../../static/assets/img/iconCardAlfred/experience.svg' : '../../static/assets/img/iconCardAlfred/no_experience.svg'} alt={'Expérimenté'} title={'Expérimenté'} className={classes.imageStyle}/>
                  </ListItemIcon>
                  <ListItemText
                    classes={{primary:classes.sizeText}}
                    primary="Expérimenté(e)"
                  />
                </ListItem>
              </List>
            </Grid>
          </CardContent>
        </Card>
        <Dialog
          open={this.state.open}
          onClose={()=>this.handleClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Supprimer un service"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Voulez-vous vraiment supprimer ce service de votre boutique ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>this.handleClose2()} color="primary">
              Annuler
            </Button>
            <Button onClick={()=>this.deleteService(this.state.id_service)} color="secondary" autoFocus>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>

    )
  }
}

CardPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true })(CardPreview);
