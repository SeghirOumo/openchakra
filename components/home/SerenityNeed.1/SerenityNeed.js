import React, { Fragment } from './node_modules/react';
import Grid from './node_modules/@material-ui/core/Grid';
import CardMedia from './node_modules/@material-ui/core/CardMedia';
import { withStyles } from './node_modules/@material-ui/core/styles';
import PropTypes from './node_modules/prop-types';
import Typography from './node_modules/@material-ui/core/Typography';
//import SerenityNeedCard from './SerenityNeedCard/SerenityNeedCard';
import CardActionArea from "./node_modules/@material-ui/core/CardActionArea";
import CardContent from "./node_modules/@material-ui/core/CardContent";
import Chip from "./node_modules/@material-ui/core/Chip";
import CardActions from "./node_modules/@material-ui/core/CardActions";
import Button from "./node_modules/@material-ui/core/Button";
import Card from "./node_modules/@material-ui/core/Card";
import axios from './node_modules/axios';
import Link from './node_modules/next/link';
import "../../../static/stylesfonts.css";

const url = "https://myalfred.hausdivision.com/";

const styles = theme => ({
  container: {
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '100%',

    // Full width for (xs, extra-small: 0px or larger) and (sm, small: 600px or larger)
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      width: 920,
    },
    [theme.breakpoints.up('lg')]: { // large: 1280px or larger
      width: 1170,
    },
    [theme.breakpoints.up('xl')]: { // extra-large: 1920px or larger
      width: 1366,
    },
  },
  media: {
    height: 0,
    borderRadius: '20px',
    paddingTop: '118.25%', // 16:9
    maxWidth: 345,
  },
  card: {

    backgroundColor:'transparent',
    textAlign:'center',
    margin:10,
    boxShadow: `1px 3px 1px transparent`,
    
    // Full width for (xs, extra-small: 0px or larger) and (sm, small: 600px or larger)
    [theme.breakpoints.up('xs')]: { // xs: 600px or larger
      maxWidth: 450,
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: 400,
    },
    [theme.breakpoints.up('md')]: { // medium: 960px or larger
      maxWidth: 350,
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 300
    },

  },
  media2: {
    height: 200
  },
  textBox1: {
    color: 'rgba(84,89,95,0.95)',
    letterSpacing: -2,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 15,
    marginTop: 60,
  },
  textBox: {
    fontFamily: 'Helvetica',
    textAlign: 'center',
    fontSize: 15,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 60,
    marginTop: 15,
  },
  grosHR: {
    height: '10px',
    backgroundColor: '#6ec1e4',
  },

});

function shuffleArray(array) {
  let i = array.length - 1;
  for (; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

class serenityNeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      service: [],
    }
  }

  componentDidMount() {

    axios.get(url+'myAlfred/api/service/all')
        .then(response => {
          let service = response.data;

          this.setState({service: service})

        })
  }

  render() {
    const {classes} = this.props;
    const {service} = this.state;
    const resdata = shuffleArray(service);
    const services = resdata.slice(0, 8).map(e => (
        <Grid item xs={12} sm={6} md={3} lg={3} key={e._id}>
          <Card className={classes.card}>
            <CardActionArea>
              <CardMedia
                  className={classes.media2}
                  image={e.picture}
                  title="Paysage"
              />
              <CardContent>
                
                <Typography gutterBottom variant="h5" component="h2">
                 
                </Typography>
                <Typography component="p">
                  {e.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              
            </CardActions>
          </Card>
        </Grid>
    ));

    return (
        <Fragment>
          <Grid container className={classes.container}>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              <div>
                <Typography variant="h4" className={classes.textBox1}>
                Retrouvez de la sérénité !
                </Typography>
                <Grid container>
                  <Grid item xs={5}></Grid>
                  <Grid item xs={2}><hr className={classes.grosHR}/></Grid>
                  <Grid item xs={5}></Grid>
                </Grid>
                <Typography className={classes.textBox}>
                Pensez à vous, libérez vous l’esprit de certaines contraintes et profitez du temps et du talents des autres…<br/> 
                Echappez à votre quotidien, prenez le temps de trouver votre Alfred avec d’excellents commentaires pour
                les services dont vous avez besoin !!!
                </Typography>
              </div>
            </Grid>
            <Grid item xs={2}></Grid>
          
            

            {services}
          </Grid>
        </Fragment>
    );
  }
};

serenityNeed.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(serenityNeed);
