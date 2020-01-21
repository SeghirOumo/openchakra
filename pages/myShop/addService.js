import React from 'react';
import Router from 'next/router';
import Layout from '../../hoc/Layout/Layout';
import Footer from '../../hoc/Layout/Footer/Footer';
import { Formik, Field, ErrorMessage, FieldArray} from 'formik';
import axios from 'axios';
import InputRange from 'react-input-range';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from "@material-ui/core/Grid";
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import * as Yup from 'yup';
import Switch from "@material-ui/core/Switch";
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import Select from 'react-select';
import MaterialSelect from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AddressFinder from '../../components/WizardForm/AddressFinder';
import { toast } from "react-toastify";
import Loader from 'react-loader-spinner';
import Clear from '@material-ui/icons/Clear';
import Link from 'next/link';
import styled from 'styled-components';
import MultipleSelect from '../../components/WizardForm/MultipleSelect';
import Schedule from '../../components/Schedule/Schedule';

const { config } = require('../../config/config');
const url = config.apiUrl;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const styles = theme => ({
  bigContainer: {
      marginTop: 68,
      flexGrow: 1,
  },
  field1:{
    width: '50%',
    [theme.breakpoints.down('sm')]: {
      width:'90%',
      margin:'auto'
  }},
   sidebg:{
      display:'block',
      [theme.breakpoints.down('sm')]: {
          display: 'none!important',
      }
   },
   bottombar:{
    visibility:'hidden',
     [theme.breakpoints.down('sm')]: {
       visibility:'visible',
       boxShadow: '2px -5px 14px -15px rgba(0,0,0,0.75)'
   }},
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 3rem 0 3rem',
    [theme.breakpoints.down('sm')]: {
      padding: '0'
    },
    fontFamily: 'helvetica',
    height: 'auto',
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  checkboxespart: {
    marginTop: 25,
  },
  obligations: {
    marginTop: 31,
  },
  input: {
    display: 'none',
  },
  button: {
    margin: theme.spacing,
  },
  newContainer: {
    padding: 20,
  },
  imgDiv: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  delayDivResponsive: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  selectDelayInputRepsonsive: {
    [theme.breakpoints.down('sm')]: {
      width: '100%!important',
    },
  },
  inputDiplomaCertifResp: {
    [theme.breakpoints.down('sm')]: {
      width: '100%!important',
    },
  },
  prestationsPres: {
    [theme.breakpoints.down('sm')]: {
      padding: '0!important',
    }
  },
  contentCheckBox: {
    display:'flex',
    alignItems: 'center',
    fontFamily: 'helvetica',
  },
  inputTextField: {
    color:'white',
    fontSize: '1em',
    fontFamily: 'helvetica',
  },
  responsiveIOSswitch:{
    width: '70%',
    [theme.breakpoints.down('xs')]: {
      width: '50%',
    }
  },
  responsiveIOSswitchContent:{
    display:'flex',
    flexDirection:'row',
    width:'30%',
    alignItems: 'flex-end',
    justifyContent:'end',
    [theme.breakpoints.down('xs')]: {
      width:'50%',
    }
  },
  contentFiltre:{
    width:'100%',
    display:'flex',
    alignItems: 'last baseline',
    height:'50px',
    marginBottom:'2%',
    [theme.breakpoints.down('xs')]: {
      height:'90px',
    }
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '70px',
  },
  topbar:{
    visibility:'visible',
    position: 'sticky',
    top: 65,
    zIndex:999,
    [theme.breakpoints.down('sm')]: {
      visibility:'hidden',
    }},
  containercalendar:{
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      width:'100%!important',

    }},
});

class Wizard extends React.Component {
  static Page = ({ children }) => children;

  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      values: props.initialValues,
      hasId: false
    };
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
    axios.get(url+'myAlfred/api/users/current')
      .then(res => {
        console.log(res);
        if (typeof res.data.id_card !== 'undefined') this.setState({ hasId: true });
      })
      .catch(error => {
        console.log(error);
      })
  }

  next = values =>
    this.setState(state => ({
      page: Math.min(state.page + 1, this.props.children.length - 1),
      values,
    }));

  previous = () =>
    this.setState(state => ({
      page: Math.max(state.page - 1, 0),
    }));

  validate = values => {
    const activePage = React.Children.toArray(this.props.children)[
      this.state.page
      ];
    return activePage.props.validate ? activePage.props.validate(values) : {};
  };

  handleSubmit = (values, bag) => {
    const { children } = this.props;
    const { page } = this.state;
    const isLastPage = page === React.Children.count(children) - 1;
    if (isLastPage) {

      console.log("Sending availabilities");
      axios.defaults.headers.common["Authorization"] = localStorage.getItem("token");
      this.props.availabilities.forEach( avail => {
        axios.post(url + "myAlfred/api/availability/add", avail);
      });
      console.log("After sending availabilities");

      values.submission.forEach(e => {
        let arrayPrestations = [];
        let arrayEquipments = [];
        const service = e.serviceId;
        e.filters.forEach(a => {
          a.prestations.forEach(b => {

            if(b.checked === true) {
              const newObj = {prestation: b.id, price: b.price, billing:b.billing};
              arrayPrestations.push(newObj);

            }
          })
        })
        e.equipments.forEach(c => {

          if(c.checked === true) {
            arrayEquipments.push(c.id);
          }
        })
        let option = null;
        if (e.option !== null) {
          option = {label: e.option.label, price: e.option.price, unity: e.option.unity.value, type: e.option.type.value};
        }
        const experienceYears = e.experienceYears.value;
        const city = e.city.value;
        const perimeter = e.perimeter;
        const minimum_basket = e.minimumBasket;
        const deadline_before_booking = e.delayBeforeShop + ' ' + e.delayBeforeShopDWM;
        const description = e.descService;

        let graduated = false;
        let diploma = null;
        let diplomaLabel = null;
        let diplomaYear = null;
        if(e.diploma !== null) {
          graduated = true;
          diploma = e.diploma.diploma;
          diplomaLabel = e.diploma.label;
          diplomaYear = e.diploma.year;

        }
        let is_certified = false;
        let certification = null;
        let certificationYear = null;
        let certificationLabel = null;
        if(e.certification !== null) {
          is_certified = true;
          certification = e.certification.certification;
          certificationLabel = e.certification.label;
          certificationYear = e.certification.year;
        }

        let active = false;
        let price = 0;
        if(e.increases.checked === true) {
          active = true;
          price = e.increases.price;
        }
        const formData = new FormData();
        formData.append('service',service);
        formData.append('option', JSON.stringify(option));
        formData.append('experience_years', experienceYears);
        formData.append('prestations',JSON.stringify(arrayPrestations));
        formData.append('equipments',JSON.stringify(arrayEquipments));
        formData.append('city',city);
        formData.append('perimeter',perimeter);
        formData.append('minimum_basket',minimum_basket);
        formData.append('deadline_before_booking',deadline_before_booking);
        formData.append('graduated',graduated.toString());
        formData.append('diploma',diploma);
        formData.append('diplomaLabel', diplomaLabel);
        formData.append('diplomaYear', diplomaYear);
        formData.append('is_certified',is_certified.toString());
        formData.append('certification',certification);
        formData.append('certificationLabel', certificationLabel);
        formData.append('certificationYear', certificationYear);
        formData.append('active',active.toString());
        formData.append('price',price.toString());
        formData.append('description',description);

        formData.append('home',e.location.client);
        formData.append('alfred',e.location.alfred);
        formData.append('visio',e.location.visio);

        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        console.log("FormData is:"+JSON.stringify(formData));
        axios.post(url+'myAlfred/api/serviceUser/add',formData)
          .then(res => {
            const booking_request = values.createShop.booking_request;
            const no_booking_request = values.createShop.no_booking_request;
            const my_alfred_conditions = values.createShop.my_alfred_conditions;
            const profile_picture = values.createShop.profile_picture_user;
            const identity_card = values.createShop.identity_card;
            const recommandations = values.createShop.recommandations;
            const welcome_message = values.createShop.welcome_message;
            const flexible_cancel = values.createShop.flexible_cancel;
            const moderate_cancel = values.createShop.moderate_cancel;
            const strict_cancel = values.createShop.strict_cancel;
            const is_particular = values.createShop.is_particular;
            const is_professional = values.createShop.is_professional;
            const self_employed = values.createShop.is_microCompany;
            const individual_company = values.createShop.isIndividualCompany;
            const name = values.createShop.denomination;
            const creation_date = values.createShop.creationDate;
            const naf_ape = values.createShop.nafape;
            const siret = values.createShop.siret;

            const option_presta_user = values.createShop.option_presta_user;
            const option_presta_home = values.createShop.option_presta_home;
            const option_presta_visio = values.createShop.option_presta_visio;


            axios.get(`${url}myAlfred/api/serviceUser/currentAlfred`)
              .then(response => {
                let data = response.data;
                let arrayService = [];

                data.forEach(q => {

                  arrayService.push(q._id);

                });

                axios.post(url+'myAlfred/api/shop/add',{booking_request,no_booking_request,my_alfred_conditions,profile_picture,identity_card
                  , recommandations, welcome_message,flexible_cancel,moderate_cancel,strict_cancel,is_particular,is_professional,
                                    self_employed,individual_company,name,creation_date,naf_ape,siret,arrayService,option_presta_user,option_presta_home,option_presta_visio})
                  .then(result => {

                    const formDataIdProfile = new FormData();
                    formDataIdProfile.append('myCardR',values.createShop.id_recto);
                    if (values.createShop.id_verso !== null) {
                      formDataIdProfile.append('myCardV',values.createShop.id_verso);
                    }
                    axios.post(url+'myAlfred/api/users/profile/idCard',formDataIdProfile)
                      .then(res => {

                      })
                      .catch(err => {
                        console.log(err);
                      })

                    const profilePicture = values.alfredUpdate.profile_picture_user;
                    const formDataPicture = new FormData();
                    formDataPicture.append('myImage',profilePicture);
                    axios.post(url+'myAlfred/api/users/profile/picture',formDataPicture)
                      .then(res => {

                      })
                      .catch(err => {
                        console.log(err);
                      })
                    axios.put(url+'myAlfred/api/users/users/becomeAlfred')
                      .then(res => {
                        toast.info('Service ajouté avec succès');
                        Router.push('/myShop/services');

                      })
                      .catch(err => {
                        console.log(err);
                      })

                    return console.log(values);


                  })
                  .catch(error => {
                    console.log(error);
                  })
              })
          })
          .catch(err => {
            console.log(err);
          })
      });
 

    } else {
      bag.setTouched({});
      bag.setSubmitting(false);
      this.next(values);
    }
  };

  phoneRegEx = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  Step0Schema = null;
  Step1Schema = null;
  Step2Schema = Yup.object().shape({
    submission: Yup.array().of(Yup.object().shape({
      minimumBasket: Yup.number().typeError('Un nombre est requis pour le minimum d\'achat').moreThan(0,'Le prix doit être supérieur à 0€').required('Le minimum d\'achat est requis'),
      delayBeforeShopDWM: Yup.string().typeError('Choisissez parmi heures, jours et semaines').required('Choisissez parmi heures, jours et semaines'),
      city: Yup.string().typeError('Veuillez entrer la ville où le service sera pratiqué').required('Veuillez entrer la ville où le service sera pratiqué'),
      filters: Yup.array().of(Yup.object().shape({
        prestations: Yup.array().of(Yup.object().shape({
          checked: Yup.boolean(),
          price: Yup.number().when('checked', {
            is: true,
            then: Yup.number().typeError('Le prix doit être un nombre').moreThan(0, 'Le prix doit être supérieur à 0€').required('Veuillez entrer un prix'),
            otherwise: Yup.number().nullable(true),
          }),
          billing: Yup.string().when('checked', {
            is: true,
            then: Yup.string().typeError('Veuillez sélectionner une méthode de facturation').required('Veuillez sélectionner une méthode de facturation'),
            otherwise: Yup.string().notRequired().nullable(),
          })
        }))
      }))
    }))
  });
  Step3Schema = null;
  Step4Schema = Yup.object().shape({
    createShop: Yup.object().shape({
      welcome_message: Yup.string().min(10, 'Votre message doit faire au minimum 10 caractères').required('Veuillez entrer un message de bienvenue'),
    })
  });
  Step5Schema = Yup.object().shape({
    createShop: Yup.object().shape({
      is_professional: Yup.boolean(),
      id_recto: Yup.lazy(() => {
        if (this.state.hasId === false) {
          return Yup.mixed().required('Veuillez uploader le recto de votre carte d\'identité ou bien votre passeport');
        }
        return Yup.mixed().notRequired();
      }),
      id_verso: Yup.mixed(),
      siret: Yup.string()
        .when('is_professional', {
          is: true,
          then: Yup.string().length(14, 'Mauvais code siret').required('Veuillez entrer un code siret'),
          otherwise: Yup.string().notRequired(),
        }),
      denomination: Yup.string()
        .when('is_professional', {
          is: true,
          then: Yup.string().required('Veuillez entrer une dénomination'),
          otherwise: Yup.string().notRequired(),
        }),
      creationDate: Yup.string()
        .when('is_professional', {
          is: true,
          then: Yup.string().required('Veuillez entrer une date de création'),
          otherwise: Yup.string().notRequired(),
        }),
      nafape: Yup.string()
        .when('is_professional', {
          is: true,
          then: Yup.string().length(5, 'Code APE invalide'),
          otherwise: Yup.string().notRequired(),
        }),
      nature_juridique: Yup.string()
        .when('is_professional', {
          is: true,
          then: Yup.string().required('Veuillez renseigner le statut juridique'),
          otherwise: Yup.string().notRequired(),
        }),
      isEngaged: Yup.boolean().oneOf([true], 'Veuillez vous engager'),
      isCertified: Yup.boolean()
        .when('is_professional', {
          is: true,
          then: Yup.boolean().oneOf([true], 'Veuillez vous certifier'),
          otherwise: Yup.boolean(),
        }),
    })
  })

  schemaArray =[this.Step0Schema, this.Step1Schema, this.Step2Schema, this.Step3Schema, this.Step4Schema, this.Step5Schema];

  render() {
    const { schemaArray } = this;
    const { children } = this.props;
    const { page, values } = this.state;
    const activePage = React.Children.toArray(children)[page];
    const textLabel = values.submission.map(pc => {
      return pc.serviceLabel
    });

    return (
      <Formik
        initialValues={values}
        enableReinitialize={false}
        validationSchema={schemaArray[page]}
        validate={this.validate}
        onSubmit={this.handleSubmit}
        render={({ values, handleSubmit }) => (
          <React.Fragment>
            {page !== 0 && <div style={{backgroundColor: 'white'}}>
              {page === 1 ? <h3 style={{fontFamily: 'Helvetica', marginLeft: 10, color: 'black', paddingTop: '1.5rem'}}>Etape 1 - Configuration de votre service - {textLabel}</h3> : null}
              {page === 2 ? <h3 style={{fontFamily: 'Helvetica', marginLeft: 10, color: 'black', paddingTop: '1.5rem'}}>Etape 2 - Indiquez vos disponibilités et conditions</h3> : null}
              <div>
                <Bar style={{backgroundColor: '#cacfe4'}}>
                  {page === 1 ? <Fill width={'20%'} /> : null}
                  {page === 2 ? <Fill width={'40%'} /> : null}
                </Bar>
              </div>
            </div>}
            <form onSubmit={handleSubmit} style={{display: 'flex', flexFlow: 'row', height: '94vh'}}>
              <div style={{position: 'relative', backgroundColor: 'white', width: page === 0 ? '100%' : 'none', height: '100%', overflow: 'hidden'}}>
                <div id="bigDiv" className="noscrollbar" style={{height: page === 0 ? '100%' : '81%', overflowY: page === 2 ? 'hidden' : 'scroll', position: 'relative'}}>
                  {activePage}
                </div>
                <div className={page === 2 || page === 5 ? 'step3buttons' : null} style={{position: 'absolute', bottom: page === 0 ? 0 : '7%', left: 0, width: '100%', padding: page !== 2 || page !== 5 ? '0rem 3rem 3rem 3rem' : null, backgroundColor: page === 5 ? 'white' : 'transparent', zIndex: '999'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', flexFlow: page === 0 ? 'row-reverse' : 'row'}}>
                    {page !== 0 && <React.Fragment><Button
                      color="primary"
                      type="button"
                      onClick={() => {
                        const div = document.getElementById('bigDiv');
                        div.scrollTop = 0;
                        this.previous();
                      }}
                      disabled={page === 0}
                    >
                      Retour
                    </Button>
                    </React.Fragment>
                    }
                    {page === 0 && <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      style={{color: 'white'}}
                      disabled={values.submission.length <= 0}
                      onClick={() => {
                        const div = document.getElementById('bigDiv');
                        div.scrollTop = 0;
                      }}
                    >
                      Suivant
                    </Button>}
                    {page === 1 &&
                      <Field render={({form}) => {
                        const checkArr = [];
                        form.values.submission.map((pc, index) => {
                          if (pc.prestationsCount > 0 && pc.filters[index].prestations[index].price > 0) {
                            return checkArr.push(true);
                          } else {
                            return checkArr.push(false);
                          }
                        });
                        const check = el => {
                          return el === false;
                        };
                        return (
                          <React.Fragment>
                            <Button
                              type="submit"
                              variant="contained"
                              color="secondary"
                              style={{color: !checkArr.some(check) ? 'white' : null }}
                              disabled={checkArr.some(check)}
                              onClick={() => {
                                if (typeof form.errors.submission === 'undefined') {
                                  const div = document.getElementById('bigDiv');
                                  div.scrollTop = 0;
                                } else {
                                  toast.error(<div>Les services suivants n'ont pas été correctement configurés :<br />{form.errors.submission.map((service, i) => {
                                    if (typeof service === 'undefined') {
                                      return null
                                    } else {
                                      return <p>{form.values.submission[i].serviceLabel}</p>
                                    }
                                  })}</div>)
                                }
                              }}
                            >
                              Suivant
                            </Button>
                          </React.Fragment>
                        )
                      }}
                    />}
                    {page === 2 &&
                      <Field render={({form}) => {
                        const checkArr = [];
                        form.values.submission.map(pc => {
                          if (pc.prestationsCount > 0) {
                            return checkArr.push(true);
                          } else {
                            return checkArr.push(false);
                          }
                        });
                        const check = el => {
                          return el === false;
                        };
                        return (
                          <React.Fragment>
                            <Button
                              type="submit"
                              variant="contained"
                              color="secondary"
                              style={{color: !checkArr.some(check) ? 'white' : null }}
                              disabled={checkArr.some(check)}
                              onClick={() => {
                                if (typeof form.errors.submission === 'undefined') {
                                  const div = document.getElementById('bigDiv');
                                  div.scrollTop = 0;
                                } else {
                                  toast.error(<div>Les services suivants n'ont pas été correctement configurés :<br />{form.errors.submission.map((service, i) => {
                                    if (typeof service === 'undefined') {
                                      return null
                                    } else {
                                      return <p>{form.values.submission[i].serviceLabel}</p>
                                    }
                                  })}</div>)
                                }
                              }}
                            >
                              Suivant
                            </Button>
                          </React.Fragment>
                        )
                      }}
                    />}
                  </div>
                </div>
              </div>
              <div className="imgDiv" style={{width: page === 2 ? '0%' : '100%', overflow: 'hidden', backgroundImage: page === 0 || page === 1  ? 'url("../../static/Creation_shop_step1.png")' : null , backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: page !== 3 ? 'center' : null}}>
              </div>
            </form>
          </React.Fragment>

        )}
      />
    );
  }
}

const CheckboxCustom = withStyles({
  root: {
    color: '#1C2022',
    '&$checked': {
      color: 'white',
    },
  },
  checked: {},
})(props => <Checkbox color="default" {...props} />);

const IOSSwitch = withStyles(theme => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: '#47bdd7',
      '& + $track': {
        backgroundColor: 'white',

      },
    },
    '&$focusVisible $thumb': {
      color: 'white',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const CssTextField = withStyles({
  root: {
    '& label': {
      fontSize: '0.8rem',
    },
  },
})(TextField);

const CssTextFieldOptions = withStyles({
  root: {
    '& label': {
      color: 'white',
      fontSize: '0.8rem',
    },
    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white',
    },
  },
})(TextField);

class addService extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        categories: [],
        services: [],
        filters: [],
        equipments: [],
        prestations: [],
        prestationsCheckboxes: [],
        servicesLength: 0,
        servicesValues: [],
        arrServices: [],
        arrServicesLabel: [],
        allInOneServ: null,
        isDisabledCategoryInput: false,
        isDisabledExpansionPanels: true,
        loading: false,
        prestationsCount: 0,
        profile_picture: "",
        phone: "",
        recto: "",
        verso: "",
        isChecked: false,
        isMicro_company: false,
        isIndividualCompany: false,
        siret: "",
        creationDate: "",
        denomination: "",
        nafape: "",
        isEngaged: false,
        isCertified: false,
        booking_request: true,
        my_alfred_conditions: true,
        profile_picture_user: false,
        identity_card: false,
        recommandations: false,
        flexible_cancel: true,
        moderate_cancel: false,
        strict_cancel: false,
        welcome_message: "",
        no_booking: false,
        all_options: [],
        currentUser: null,
        diplomaName: null,
        diplomaYear: null,
        diplomaObj: null,
        certifName: null,
        certifObj: null,
        checkedB: false,
        checkedC: false,
        option_presta_user: true,
        option_presta_home: true,
        option_presta_visio: true,
        availabilities: [],
        checked_presta: false,
        };
      this.toggleCheckbox = this.toggleCheckbox.bind(this);
      this.handleChecked = this.handleChecked.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
      this.availabilityCreated = this.availabilityCreated.bind(this);

    }

    availabilityCreated(avail) {
      console.log("CB created availability:"+JSON.stringify(avail));
      this.setState({availabilities: [avail, ...this.state.availabilities]});
    }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
    axios.get(url+'myAlfred/api/users/current')
      .then(res => {
        this.state.phone = res.data.phone;
        this.state.currentUser = res.data;
        this.state.userCity = {label: res.data.billing_address.city, value: res.data.billing_address.city};
        this.state.userAddress = {label: res.data.billing_address.address, value: res.data.billing_address.address};
        this.state.userZipCode = {label: res.data.billing_address.zip_code, value: res.data.billing_address.zip_code};
        this.state.userCountry = {label: res.data.billing_address.country, value: res.data.billing_address.country};
        if (typeof res.data.id_card !== 'undefined') this.state.userIdCardRecto = res.data.id_card.recto.substr(22);
        if (typeof res.data.id_card !== 'undefined') {
          if (typeof res.data.id_card.verso !== 'undefined') this.state.userIdCardVerso = res.data.id_card.verso.substr(22);
        }
      })
      .catch(error => {
        console.log(error);
      });
    axios.get(url+'myAlfred/api/category/currentAlfred')
      .then(response => {
        let categories = response.data;
        if (categories === null) {
          categories = [];
        }
        const options = categories.map(categorie => {
          return { value: categorie._id, label: categorie.label, [categorie.label.replace(/\s/g, '') + 'Services']: [] };
        });
        this.setState({ categories: options });
      })
      .catch(error => {
        console.log(error);
      });
    axios.get(url+'myAlfred/api/options/all')
      .then(res => {
        let options = res.data;
        this.setState({all_options: options});
      })
      .catch(err => console.log(err));

    axios.get(url+'myAlfred/api/availability/currentAlfred')
      .then(res => {
        let availabilities = res.data;
        this.setState({availabilities: availabilities});
      })
      .catch(err => console.log(err));

  }

  notify() {
    toast.error('erreur');
  }

  handleCategorieChange(categorie, formikCtx) {
    if (categorie === null) {
      categorie = [];
    }
    this.setState({
      categoriesFinal: [this.state.categories, categorie],
      loading: true
    });
    categorie.map((categorie, catInd) => {

      axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
      axios.get(`${url}myAlfred/api/service/currentAlfred/${categorie.value}`)
        .then((response) => {
          const services = response.data;
          if (formikCtx.form.values.categories[catInd][categorie.label.replace(/\s/g, '') + 'Services'].length > 0) {
            formikCtx.form.values.categories[catInd][categorie.label.replace(/\s/g, '') + 'Services'] = [];
          }
          const options = services.map(async (service) => {
            let arrServ = [];
            const servObj = { value: service._id, label: service.label, categorieId: categorie.value, categorieLabel: categorie.label, checked: false };
            arrServ.push(servObj);
            if (categorie.hasOwnProperty(servObj.categorieLabel.replace(/\s/g, '') + 'Services')) {
              await formikCtx.form.values.categories[catInd][servObj.categorieLabel.replace(/\s/g, '') + 'Services'].push(servObj);
              this.setState({
                isDisabledCategoryInput: true,
                isDisabledExpansionPanels: false,
              });
              this.setState({
                [servObj.categorieLabel.replace(/\s/g, '') + 'Services']: []
              });
              this.setState({
                [servObj.categorieLabel.replace(/\s/g, '') + 'Services']: formikCtx.form.values.categories[catInd][servObj.categorieLabel.replace(/\s/g, '') + 'Services']
              });
              await setTimeout(() => this.setState({ loading: false }), '2000')

            }
          });
        })
        .catch(error => {
          console.log(error)
        })
    })
  }

  toggleCheckbox(index) {
    const { prestationsCheckboxes } = this.state;

    prestationsCheckboxes[index].checked = !prestationsCheckboxes[index].checked;

    this.setState({
      prestationsCheckboxes
    });
  }

  handleChecked() {
    this.setState({ isChecked: !this.state.isChecked });
    this.setState({ isMicro_company: false });
    this.setState({ isIndividualCompany: false });
    this.setState({ siret: "" });
    this.setState({ denomination: "" });
    this.setState({ nafape: "" });
    this.setState({ creationDate: "" });
    this.setState({ isCertified: false });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

    render() {
      const {classes} = this.props;
      let dates = [];
      const actualDate = new Date().getFullYear();
      for (let i = 1950; i <= actualDate; i++) {
        dates.push(i);
      }

    return (
      <Layout>
        <Grid container className={classes.bigContainer}>
          <Grid container className={classes.topbar} justify="center" style={{backgroundColor: '#4fbdd7',marginTop: -3}}>
            <Grid item xs={2} style={{textAlign:"center",borderBottom: '2px solid white'}}>
                <Link href={'/myShop/services'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}>Ma boutique</p></a>
                </Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
                <Link href={'/myShop/messages'}><a style={{textDecoration:'none'}}>
                    <p style={{color: "white",cursor: 'pointer'}}>Messages</p></a>
                </Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
                <Link href={'/myShop/mesreservations'}><a style={{textDecoration:'none'}}>
                    <p style={{color: "white",cursor: 'pointer'}}>Mes réservations</p></a>
                </Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center",zIndex:999}}>
                <Link href={'/myShop/myAvailabilities'}><a style={{textDecoration:'none'}}>
                    <p style={{color: "white",cursor: 'pointer'}}>Mon calendrier</p></a>
                </Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
                <Link href={'/myShop/performances'}><a style={{textDecoration:'none'}}>
                    <p style={{color: "white",cursor: 'pointer'}}>Performance</p></a>
                </Link>
            </Grid>
        </Grid>
          <div className="App" style={{width: '100%'}}>
            <Wizard availabilities = {this.state.availabilities}
              initialValues={{
                categories: [],
                services: [],
                submission: [],
                createShop: {
                  booking_request: true,
                  my_alfred_conditions: true,
                  profile_picture_user: false,
                  identity_card: false,
                  recommandations: false,
                  welcome_message: 'Je vous remercie pour votre réservation.',
                  id_recto: null,
                  id_verso: null,
                  is_particular: false,
                  is_professional: false,
                  is_microCompany: false,
                  isIndividualCompany: false,
                  flexible_cancel: true,
                  moderate_cancel: false,
                  strict_cancel: false,
                  siret: '',
                  creationDate: '',
                  denomination: '',
                  nafape: '',
                  nature_juridique: '',
                  isEngaged: false,
                  isCertified: false,
                  option_presta_home: true,
                  option_presta_user: true,
                  option_presta_visio: true,
                },
                alfredUpdate: {
                  phone: null,
                  profile_picture_user: null,
                },
                checkArr: []
              }}
              onSubmit={(values, actions) => {
                sleep(300).then(() => {
                  window.alert(JSON.stringify(values, null, 2));
                  actions.setSubmitting(false);
                });
              }}
            >
              <Wizard.Page>
                <Grid container className={classes.cardContainer} style={{display: 'flex', justifyContent: 'start'}}>
                  <div style={{padding: '0rem 2rem 1rem 2rem'}}>
                    <Typography variant="h6" style={{marginBottom: '.5rem', marginTop: '1rem'}}>Votre catégorie de service</Typography>
                    <Typography>
                      Commencez par sélectionner votre catégorie de service. Par exemple, si vous souhaitez réaliser un service de coiffure, sélectionnez la catégorie «Beauté et bien-être».
                    </Typography>
                  </div>
                  <FieldArray
                    name="categories"
                    render={(arrayHelpers) => (
                      this.state.categories && this.state.categories.length > 0 ? (
                        <div style={{padding: '.5rem 2rem'}}>
                          <Select
                            noOptionsMessage="Pas de catégorie disponible"
                            className="indicator"
                            classNamePrefix="indicator"
                            closeMenuOnSelect={true}
                            placeholder="Sélectionnez votre catégorie..."
                            value={arrayHelpers.form.values.categories}
                            options={this.state.categories}
                            onChange={categorie => {
                              if (categorie === null) {
                                arrayHelpers.form.setFieldValue('categories', []);
                              } else {
                                arrayHelpers.form.setFieldValue('categories', [categorie]);
                              }
                              arrayHelpers.form.setFieldValue('submission', []);
                              arrayHelpers.form.setFieldValue('services', []);
                              this.setState({ isDisabledExpansionPanels: true });
                              this.setState({checked_presta: false});
                            }}

                            theme={theme => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#2FBCD3',
                              }
                            })}
                            styles={{
                              indicatorsContainer: (styles) => {
                                return {
                                  ...styles,
                                  ':nth-child(1)': {
                                    color: '#F8727F !important',
                                  }
                                }
                              }
                            }}
                          />
                          <Button
                            color="primary"
                            style={{marginTop: '1rem', marginBottom: '2rem', color: 'white', borderRadius: 8}}
                            type="button"
                            variant="contained"
                            onClick={() => {
                              if (arrayHelpers.form.values.categories !== '' && arrayHelpers.form.values.categories != null) {
                                this.handleCategorieChange(arrayHelpers.form.values.categories, arrayHelpers);
                                this.setState({checked_presta: !this.state.checked_presta});
                              }
                            }}>
                            Je valide cette catégorie
                          </Button>
                          <div>
                            <Typography variant="h6" style={{marginBottom: '.5rem'}}>Votre service</Typography>
                            <Typography>
                              Sélectionnez maintenant le service que vous souhaitez proposer dans la catégorie sélectionnée. Vous pourrez choisir les prestations que vous souhaitez proposer dès la prochaine étape !
                            </Typography>
                            <Typography>
                              Un service n'apparaît pas ? Contactez l’équipe My-Alfred à l’adresse <a href="mailto:unservicedeplus@my-alfred.io">unservicedeplus@my-alfred.io</a>
                            </Typography>
                          </div>
                          <div style={{marginTop: '1rem'}}>
                            {arrayHelpers.form.values.categories && arrayHelpers.form.values.categories.length > 0 && this.state.loading === false && this.state.checked_presta === true  ? (
                              arrayHelpers.form.values.categories.map((categorie) => {
                                return (
                                  <Select
                                    noOptionsMessage="Pas de service disponible"
                                    className="indicator"
                                    classNamePrefix="indicator"
                                    closeMenuOnSelect={true}
                                    placeholder="Sélectionnez votre Service..."
                                    value={arrayHelpers.form.values.services}
                                    options={categorie[categorie.label.replace(/\s/g, '') + 'Services']}
                                    onChange={service => {
                                      if (service===null) {
                                        arrayHelpers.form.setFieldValue('services', []);
                                      }
                                      else {
                                        arrayHelpers.form.setFieldValue('services', [service]);
                                      }
                                      const servicesLength = arrayHelpers.form.values.services.length;
                                      this.setState({
                                        servicesLength,
                                        servicesValues: arrayHelpers.form.values.services
                                      })
                                    }}
                                    theme={theme => ({
                                      ...theme,
                                      colors: {
                                        ...theme.colors,
                                        primary: '#2FBCD3',
                                      }
                                    })}
                                    styles={{
                                      indicatorsContainer: (styles) => {
                                        return {
                                          ...styles,
                                          ':nth-child(1)': {
                                            color: '#F8727F !important',
                                          }
                                        }
                                      }
                                    }}
                                  />
                                )})
                            ):(this.state.loading === true
                              ? <Loader
                                type="TailSpin"
                                color="#2FBCD3"
                                height={100}
                                width={100}
                                style={{textAlign: 'center'}}
                              />
                              :
                              <Typography align="center" style={{fontSize: 15, marginTop: '2rem', color: '#F8727F'}}>Sélectionnez votre catégorie pour afficher les services disponibles</Typography>)}
                          </div>
                        </div>
                      ): (<p style={{padding: '0 2rem'}}>Chargement...</p>)
                    )}
                  />
                  <Field>
                    {({form}) => {
                      return form.values.services && form.values.services.length > 0 ?
                        <div style={{padding: '0 2rem 1rem 2rem'}}>
                          <Button
                            color="primary"
                            style={{marginTop: '3rem', color: 'white', borderRadius: 8}}
                            variant="contained"
                            type="button"
                            onClick={() => {
                              let servCompObjArr = [];
                              let uniqueIdFilters = [];
                              let uniqueIdPrestations = [];
                              const services = form.values.services;
                              services.map((service, index) => {
                                this.setState({
                                  [`userCityClicked${index}`]: false,
                                  [`otherOptionChecked${index}`]: false
                                });
                                axios.get(`${url}myAlfred/api/service/${service.value}`)
                                  .then(res => {
                                    let servCompObj = {
                                      CategoryLabel : res.data.category.label,
                                      location: res.data.location,
                                      serviceId: res.data._id,
                                      serviceLabel: res.data.label,
                                      descService: '',
                                      minimumBasket: '1',
                                      diploma: {
                                        label: null,
                                        year: null,
                                        diploma: null
                                      }, certification: {
                                        label : null,
                                        year: null,
                                        certification: null
                                      }, perimeter: 5,
                                      delayBeforeShop: 1,
                                      delayBeforeShopDWM: 'jours',
                                      city: this.state.userCity,
                                      address: this.state.userAddress,
                                      postal_code: this.state.userZipCode,
                                      country: this.state.userCountry,
                                      experienceYears: '',
                                      option: null,
                                      increases: {
                                        label: res.data.majoration,
                                        price: 0, checked: false
                                      },
                                      prestationsCount: 0,
                                      cancelChoice: false,
                                      equipments: [],
                                      filters: []
                                    };
                                    res.data.equipments.map(e => {
                                      const equipObj = { id: e._id, label: e.label, logo: e.logo, name_logo: e.name_logo, checked: false };
                                      servCompObj.equipments.push(equipObj);
                                    });
                                    this.state.arrServicesLabel.push(res.data);

                                    axios.get(`${url}myAlfred/api/prestation/${service.value}`)
                                      .then(res => {
                                        res.data.map(filters => {
                                          const filterObj = { id: filters.filter_presentation._id, label: filters.filter_presentation.label, prestations : [] };
                                          servCompObj.filters.push(filterObj);
                                          uniqueIdFilters = Array.from(new Set(servCompObj.filters.map(a => a.id)))
                                            .map(id => {
                                              return servCompObj.filters.find(a => a.id === id)
                                            });
                                          servCompObj.filters = uniqueIdFilters;

                                          axios.get(`${url}myAlfred/api/prestation/${service.value}/${filterObj.id}`)
                                            .then(res => {
                                              res.data.map(prestation => {
                                                const prestationObj = { id: prestation._id, label: prestation.label, filterId: prestation.filter_presentation, price: null, billingChoice: prestation.billing, billing: null, checked: false };
                                                servCompObj.filters.map(p => {
                                                  if (p.id === prestationObj.filterId) {
                                                    p.prestations.push(prestationObj);
                                                    uniqueIdPrestations = Array.from(new Set(p.prestations.map(a => a.id)))
                                                      .map(id => {
                                                        return p.prestations.find(a => a.id === id)
                                                      });
                                                    p.prestations = uniqueIdPrestations;
                                                  }
                                                })
                                              })
                                            })
                                        });
                                        servCompObjArr.push(servCompObj);
                                        this.state.arrServices.push(res.data);
                                        this.setState({
                                          allInOneServ: servCompObjArr
                                        });
                                        form.setFieldValue('submission', this.state.allInOneServ);
                                      })
                                  })
                              });
                            }}
                          >
                            Je valide ce service
                          </Button>
                        </div>
                        :
                        <div style={{padding: '0 2rem 1rem 2rem'}}>
                          <Button
                            color="primary"
                            style={{marginTop: '3rem', color: 'white', borderRadius: 8}}
                            variant="contained"
                            type="button"
                            disabled={true}
                          >
                            Je valide ce service
                          </Button>
                        </div>
                    }}
                  </Field>
                </Grid>
                </Wizard.Page>
                <Wizard.Page>
                  <Grid container className={classes.cardContainer} style={{overflow: 'hidden'}}>
                    <FieldArray
                      name="submission"
                      render={(arrayHelpers) => {
                        return this.state.allInOneServ && this.state.allInOneServ.length > 0 ?
                          <React.Fragment>
                            <div style={{textAlign: 'justify'}}>
                              <Typography variant="h6" style={{marginBottom: '.5rem'}}>Paramétrez vos prestations<span style={{color: '#F8727F' }}>*</span></Typography>
                              <Typography>
                                Indiquez les prestations que vous souhaitez réaliser. Pour chacune, indiquez votre tarif et le mode de facturation que vous souhaitez appliquer.
                              </Typography>
                            </div>
                            {this.state.allInOneServ.map((s, index) => {
                              return(
                                <div>
                                  <div>
                                    <Grid>
                                      {s.filters.map((f, indexf) => {
                                        return (
                                          <Grid
                                            item
                                            xs={12}
                                            key={f.id}
                                            className={classes.prestationsPres}
                                          >
                                            <p>{f.label === "Aucun" ? null : f.label}</p>
                                            <Grid>
                                              {f.prestations.map((p, indexp) => {
                                                return(
                                                  <Grid key={p.id} className={classes.contentFiltre}>
                                                    <div className={classes.responsiveIOSswitch}>
                                                      <FormControlLabel
                                                        control={
                                                          <IOSSwitch
                                                            color="primary"
                                                            type="checkbox"
                                                            checked={p.checked}
                                                            onChange={() => {
                                                              p.checked = !p.checked;
                                                              if (p.checked === true) {
                                                                arrayHelpers.form.setFieldValue(`submission[${index}].prestationsCount`, arrayHelpers.form.values.submission[index].prestationsCount + 1);
                                                              } else {
                                                                arrayHelpers.form.setFieldValue(`submission[${index}].prestationsCount`, arrayHelpers.form.values.submission[index].prestationsCount - 1);
                                                              }
                                                              arrayHelpers.form.setFieldValue(`submission[${index}].filters[${indexf}].prestations[${indexp}].checked`, p.checked);
                                                            }}
                                                          />
                                                        }
                                                        label={p.label}
                                                      />
                                                    </div>
                                                    <div className={classes.responsiveIOSswitchContent}>
                                                      {p.checked === true ?
                                                        <React.Fragment>
                                                          <Field
                                                            name={`submission.${index}.filters[${indexf}].prestations[${indexp}].price`}
                                                            placeholder="prix"
                                                            render={({field}) => {
                                                              return (
                                                                <React.Fragment>
                                                                  <CssTextField
                                                                    {...field}
                                                                    value={field.value}
                                                                    label={`Prix`}
                                                                    type="number"
                                                                    onChange={(e)=>{
                                                                      arrayHelpers.form.setFieldValue(`submission.${index}.filters[${indexf}].prestations[${indexp}].price`, e.target.value);
                                                                    }}
                                                                    className={classes.textField}
                                                                    disabled={!p.checked}
                                                                    InputProps={{
                                                                      inputProps: {
                                                                        min: 0
                                                                      },
                                                                      endAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                                    }}
                                                                  />
                                                                </React.Fragment>
                                                              )
                                                            }}
                                                          />
                                                          <Field
                                                            name={`submission.${index}.filters[${indexf}].prestations[${indexp}].billing`}
                                                            placeholder="méthode de facturation"
                                                            render={({field, form}) => {
                                                              console.log(form.values.submission[0].filters[0].prestations[0].billingChoice[0].label,'form')
                                                              return (
                                                                <React.Fragment>
                                                                  <MaterialSelect
                                                                    {...field}
                                                                    style={{width: '100px', fontSize: '0.8rem'}}
                                                                    helperText={`Méthode de facturation`}
                                                                    disabled={!p.checked}
                                                                    margin="none"
                                                                    onChange={event => {
                                                                      this.setState({ [`billingChoice${index}${indexf}${indexp}`]: event.target.value });
                                                                      form.setFieldValue(`submission.${index}.filters[${indexf}].prestations[${indexp}].billing`, event.target.value);
                                                                    }}

                                                                    value={field.value}
                                                                  >
                                                                    {p.billingChoice.map(option => {
                                                                      return (
                                                                        <MenuItem style={{fontSize:'0.8'}} key={option._id} value={option.label}>
                                                                          {option.label}
                                                                        </MenuItem>
                                                                      )
                                                                    })}
                                                                  </MaterialSelect>
                                                                </React.Fragment>
                                                              )
                                                            }}
                                                          />
                                                        </React.Fragment>
                                                        : null}
                                                    </div>
                                                  </Grid>
                                                )
                                              })}
                                            </Grid>
                                          </Grid>
                                        )
                                      })
                                      }
                                    </Grid>
                                    <hr style={{margin: '1rem 0'}}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Où acceptez-vous de réaliser vos prestations ?</Typography>
                                      <Grid item>
                                        <Field render={({form}) => {
                                          if (s.location.client===false) { if (form.values.createShop.option_presta_user!==false) {form.setFieldValue('createShop.option_presta_user', false)}; return "" } else
                                          return(
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  value={form.values.createShop.option_presta_user}
                                                  color="primary"
                                                  icon={<CircleUnchecked/>}
                                                  checkedIcon={<RadioButtonCheckedIcon/>}
                                                  checked={form.values.createShop.option_presta_user}
                                                  name={"option_presta_user"}
                                                  onChange={() => {
                                                    form.values.createShop.option_presta_user = !form.values.createShop.option_presta_user;
                                                    form.setFieldValue('createShop.option_presta_user', form.values.createShop.option_presta_user);
                                                  }}
                                                />
                                              }
                                              label={<React.Fragment>
                                                <p style={{fontFamily: 'Helvetica'}}>A l'adresse de prestation de mon client</p>
                                              </React.Fragment>}
                                            />
                                          )
                                        }
                                        }
                                        />
                                      </Grid>
                                      <Grid item>
                                        <Field render={({form}) => {
                                          if (s.location.alfred===false) { if (form.values.createShop.option_presta_home!==false) {form.setFieldValue('createShop.option_presta_home', false)}; return "" } else
                                          return(
                                            <FormControlLabel
                                              control={
                                                <Checkbox
                                                  color="primary"
                                                  icon={<CircleUnchecked/>}
                                                  checkedIcon={<RadioButtonCheckedIcon />}
                                                  checked={form.values.createShop.option_presta_home}
                                                  value={form.values.createShop.option_presta_home}
                                                  name={"option_presta_home"}
                                                  onChange={() => {
                                                    form.values.createShop.option_presta_home = !form.values.createShop.option_presta_home;
                                                    form.setFieldValue('createShop.option_presta_home', form.values.createShop.option_presta_home);
                                                  }}
                                                />
                                              }
                                              label={<React.Fragment>
                                                <p style={{fontFamily: 'Helvetica'}}>A mon domicile</p>
                                              </React.Fragment>}
                                            />
                                          )
                                        }
                                        }
                                        />
                                      </Grid>
                                    <Grid item>
                                      <Field render={({form}) => {
                                        if (s.location.visio===false) { if (form.values.createShop.option_presta_visio!==false) {form.setFieldValue('createShop.option_presta_visio', false)}; return "" } else
                                        return(
                                      <FormControlLabel
                                        control={
                                            <Checkbox
                                              color="primary"
                                              icon={<CircleUnchecked/>}
                                              checkedIcon={<RadioButtonCheckedIcon />}
                                              checked={form.values.createShop.option_presta_visio}
                                              value={form.values.createShop.option_presta_visio}
                                              name={"option_presta_visio"}
                                              onChange={() => {
                                                form.values.createShop.option_presta_visio = !form.values.createShop.option_presta_visio;
                                                form.setFieldValue('createShop.option_presta_visio', form.values.createShop.option_presta_visio);
                                              }}
                                            />
                                        }
                                        label={<React.Fragment>
                                            <p style={{fontFamily: 'Helvetica'}}>En visioconférence</p>
                                        </React.Fragment>}
                                      />
                                        )
                                      }
                                      }
                                      />
                                    </Grid>

                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Frais de déplacement</Typography>
                                      <Typography style={{marginBottom: '1rem'}}>
                                        Les frais de déplacement s'appliquent pour toutes les prestations réalisées à l'adresse de
                                        préstation indiquée par votre client. Si vous choisissez d'appliquer des frais de déplacements,
                                        ils seront automatiquement appliqués lors de la réservation.
                                      </Typography>
                                      <form noValidate autoComplete="off">
                                        <div style={{
                                          display: 'flex',
                                          width: '100%',
                                          flexDirection:'row',
                                          backgroundColor: this.state.checkedB ? '#47bdd7' : 'white',
                                          border: '1px solid #47bdd7',
                                          borderRadius: '50px',
                                          color: this.state.checkedB ? 'white' : '#47bdd7',
                                        }}>
                                          <div className={classes.contentCheckBox} style={{marginLeft: '2%', width:'10%'}}>
                                            <FormControlLabel
                                              control={
                                                <CheckboxCustom
                                                  checked={this.checkedB}
                                                  onChange={() => {
                                                    this.setState({ checkedB: !this.state.checkedB });
                                                  }}
                                                  value="checkedG"
                                                />
                                              }
                                            />
                                          </div>
                                          <div className={classes.contentCheckBox} style={{ width: '60%'}}>
                                            <label style={{ padding: '1%'}}>
                                              Frais de déplacement (montant forfaitaire)
                                            </label>
                                          </div>
                                          <div style={{display:'flex' , alignItems:'center', width:'35%', justifyContent:'center',  marginTop: '-2%'}}>
                                            <div style={{
                                              display: this.state.checkedB ? '' : 'none',
                                              width:'100px',
                                              marginRight: '1px'
                                            }}>
                                              <CssTextFieldOptions
                                                label={`Prix`}
                                                type="number"
                                                className={classes.textField}
                                                inputProps={{
                                                  endAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                  className: classes.inputTextField
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </form>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Options</Typography>
                                      <Typography style={{marginBottom: '1rem'}}>
                                        Les options vous permettent de proposer des prestations complémentaires à vos clients. Dans le cadre de prestation de repassage par exemple,
                                        vous pouvez proposer à votre client de procéder au retrait et à la livraison du linge.
                                      </Typography>
                                      <form noValidate autoComplete="off">
                                        <div style={{
                                          display: 'flex',
                                          width: '100%',
                                          flexDirection:'row',
                                          backgroundColor: this.state.checkedC ? '#47bdd7' : 'white',
                                          border: '1px solid #47bdd7',
                                          borderRadius: '50px',
                                          color: this.state.checkedC ? 'white' : '#47bdd7',
                                        }}>
                                          <div className={classes.contentCheckBox} style={{marginLeft: '2%', width:'10%'}}>
                                            <FormControlLabel
                                              control={
                                                <CheckboxCustom
                                                  checked={this.checkedC}
                                                  onChange={() => {
                                                    this.setState({ checkedC: !this.state.checkedC });
                                                  }}
                                                  value="checkedG"
                                                />
                                              }
                                            />
                                          </div>
                                          <div className={classes.contentCheckBox} style={{ width: '60%'}}>
                                            <label style={{ padding: '1%'}}>
                                              Retrait & livraison
                                            </label>
                                          </div>
                                          <div style={{display:'flex' , alignItems:'center', width:'35%'}}>
                                            <div style={{
                                              display: this.state.checkedC ? '' : 'none',
                                              width:'100px',
                                              marginRight: '1px'
                                            }}>
                                              <CssTextFieldOptions
                                                label={`Prix`}
                                                type="number"
                                                className={classes.textField}
                                                inputProps={{
                                                  className: classes.inputTextField,
                                                  endAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </form>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    {s.equipments.length === 0 ? null :
                                      <React.Fragment>
                                        <div>
                                          <Typography variant="h6" style={{marginBottom: '.5rem'}}>Indiquez ce que vous fournissez</Typography>
                                          <Typography style={{marginBottom: '1rem'}}>
                                            Sélectionnez les produits et le matériel que vous fournissez dans le cadre de vos prestations de service.
                                          </Typography>
                                        </div>
                                        <div>
                                          <Grid container>
                                            {s.equipments.map((e, indexe) => {
                                              if (e.label.includes('Selected')) {
                                                return null;
                                              }
                                              return (
                                                <Grid item xs={3} sm={3} md={2} key={e.id}>
                                                  <label style={{cursor: 'pointer'}} onClick={() => {
                                                    e.checked = !e.checked;
                                                    arrayHelpers.form.setFieldValue(`submission[${index}].equipments[${indexe}].checked`, e.checked);
                                                  }}>

                                                    {e.checked === true ? <img src={`../../static/equipments/${e.logo.slice(0, -4)}_Selected.svg`} height={100} width={100} alt={`${e.name_logo.slice(0, -4)}_Selected.svg`} /> : <img src={`../../static/equipments/${e.logo}`} height={100} width={100} alt={e.name_logo} />}
                                                    <Checkbox
                                                      style={{display: 'none'}}
                                                      color="primary"
                                                      type="checkbox"
                                                      checked={e.checked}
                                                      onChange={() => {
                                                        e.checked = !e.checked;
                                                        arrayHelpers.form.setFieldValue(`submission[${index}].equipments[${indexe}].checked`, e.checked);
                                                      }}
                                                    />
                                                  </label>
                                                </Grid>
                                              )
                                            })}
                                          </Grid>
                                        </div>
                                        <hr style={{margin: '1rem 0'}}/>
                                      </React.Fragment>
                                    }
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Définissez votre montant minimum de réservation <span style={{color: '#F8727F' }}>*</span></Typography>
                                      <Typography>
                                        Le montant minimum de réservation correspond au panier minimum requis pour réserver ce service. Si vous indiquez un montant de 10€, les clients ne pourront pas réserver vos services si la somme des prestations n’atteint pas ce montant.
                                      </Typography>
                                      <div style={{marginTop: '1rem', width: '200px'}}>
                                        <Field
                                          name={`submission.${index}.minimumBasket`}
                                          render={({field}) => {
                                            return(
                                              <TextField
                                                {...field}
                                                type="number"
                                                value={field.value}
                                                fullWidth
                                                label="Panier minimum"
                                                margin="dense"
                                                variant="outlined"
                                                InputProps={{
                                                  inputProps: {
                                                    min: 0
                                                  },
                                                  endAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                }}
                                              />
                                            )
                                          }}
                                        />
                                        <ErrorMessage name={`submission.${index}.minimumBasket`} render={msg => <div style={{color: 'red'}}>{msg}</div>}/>
                                      </div>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Renseignez votre périmètre d’intervention <span style={{color: '#F8727F' }}>*</span></Typography>
                                      <Typography>
                                        Votre périmètre d’intervention est la zone dans laquelle vous souhaitez réaliser vos services. Par défaut, nous utilisons la ville de votre profil comme référence. Cette adresse ne vous convient pas ? Vous pouvez changer votre ville de référence à tout moment !
                                      </Typography>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={this.state[`userCityClicked${index}`]}
                                            color="primary"
                                            type="checkbox"
                                            onChange={async () => {
                                              let userCityChecked = !this.state[`userCityClicked${index}`];
                                              this.setState({[`userCityClicked${index}`]: userCityChecked});

                                              if (userCityChecked === true) {
                                                arrayHelpers.form.setFieldValue(`submission[${index}].city`, null);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].address`, null);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].postal_code`, null);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].country`, null)
                                              } else {
                                                arrayHelpers.form.setFieldValue(`submission[${index}].city`, this.state.userCity);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].address`, this.state.userAddress);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].postal_code`, this.state.userZipCode);
                                                arrayHelpers.form.setFieldValue(`submission[${index}].country`, this.state.country);
                                              }
                                            }}
                                          />
                                        }
                                        label={`Sélectionner une autre ville`}
                                      />
                                      {this.state[`userCityClicked${index}`] === true ?
                                        <AddressFinder formikCtx={arrayHelpers} index={index}/>
                                        : null}
                                      <div style={{padding: '1rem 0'}}>
                                        <Typography style={{marginBottom: '1.5rem', fontSize: 17}}>Définissez le périmètre que vous souhaitez couvrir :</Typography>
                                        <InputRange
                                          formatLabel={value => `${value}km`}
                                          step={1}
                                          maxValue={200}
                                          minValue={1}
                                          value={arrayHelpers.form.values.submission[index].perimeter}
                                          onChange={inputRangeValue => arrayHelpers.form.setFieldValue(`submission[${index}].perimeter`, inputRangeValue)}
                                        />
                                      </div>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Indiquez votre délai de prévenance <span style={{color: '#F8727F' }}>*</span></Typography>
                                      <Typography>
                                        Le délai de prévenance correspond au délai nécessaire entre la réservation et la réalisation du service. Par exemple, si vous indiquez un délai de 24 heures, un client pourra réserver votre service 24 heures avant votre intervention.
                                      </Typography>
                                      <Grid item xs={12} className={classes.delayDivResponsive}>
                                        <Field
                                          name={`submission.${index}.delayBeforeShop`}
                                          render={() => {
                                            return (
                                              <React.Fragment>
                                                <div style={{width: 30, height: 30, borderRadius: '50%', border: '1px solid #2FBCD3', textAlign: "center", lineHeight: 1.6, cursor: 'pointer', display: 'inline-block', marginRight: 25 }} onClick={() => {
                                                  if (arrayHelpers.form.values.submission[index].delayBeforeShop === 0) {
                                                    return arrayHelpers.form.setFieldValue(`submission.${index}.delayBeforeShop`, 0);
                                                  }
                                                  const minusOne = arrayHelpers.form.values.submission[index].delayBeforeShop - 1;
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.delayBeforeShop`, minusOne);
                                                }}>
                                                  -
                                                </div>

                                                <div style={{display: 'inline-block', fontSize: 20, lineHeight: 2.8}}>{arrayHelpers.form.values.submission[index].delayBeforeShop}</div>
                                                <div style={{width: 30, height: 30, borderRadius: '50%', border: '1px solid #2FBCD3', textAlign: "center", lineHeight: 1.6, cursor: 'pointer', display: 'inline-block', marginLeft: 25, marginRight: '5%' }} onClick={() => {
                                                  const plusOne = arrayHelpers.form.values.submission[index].delayBeforeShop + 1;
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.delayBeforeShop`, plusOne);
                                                }}>
                                                  +
                                                </div>
                                              </React.Fragment>
                                            )
                                          }}
                                        />
                                        <Field
                                          name={`submission.${index}.delayBeforeShopDWM`}
                                          render={({field, form}) => {
                                            return (
                                              <TextField
                                                {...field}
                                                value={field.value}
                                                style={{width: '30%'}}
                                                className={classes.selectDelayInputRepsonsive}
                                                select
                                                margin="dense"
                                                variant="outlined"
                                                label="Heures / jours / semaines"
                                                InputLabelProps={{shrink: form.values.submission[index].delayBeforeShopDWM !== null}}
                                              >
                                                <MenuItem value="heures">heure(s)</MenuItem>
                                                <MenuItem value="jours">jour(s)</MenuItem>
                                                <MenuItem value="semaines">semaine(s)</MenuItem>
                                              </TextField>
                                            )
                                          }}
                                        />
                                        <ErrorMessage name={`submission.${index}.delayBeforeShopDWM`} render={msg => <div style={{color: 'red'}}>{msg}</div>}/>
                                      </Grid>
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Décrivez brievement votre expertise !</Typography>
                                      <Typography>
                                        Décrivez votre expertise et précisez votre service !
                                        Mettez en évidence vos compétences et votre expertise dans ce service.
                                        Vous pouvez également préciser la façon dont les utilisateurs doivent indiquer les quantités pour réserver.
                                        Par exemple, si vous proposez un service de confection de tapis, vous pouvez indiquer les heures nécessaires pour différentes dimension de tapis.
                                        Précisez tout ce qui peut aider votre client à réserver correctement votre service !
                                      </Typography>
                                      <Field
                                        name={`submission[${index}].descService`}
                                        render={({field}) => {
                                          return (
                                            <TextField
                                              {...field}
                                              value={field.value}
                                              id="outlined-multiline-static"
                                              label="Description du service"
                                              multiline
                                              rows="6"
                                              margin="normal"
                                              variant="outlined"
                                              style={{ width: "100%" }}
                                            />
                                          )
                                        }}
                                      />
                                      <ErrorMessage name={`submission[${index}].descService`} render={msg => <div style={{color: 'red'}}>{msg}</div>} />
                                    </div>
                                    <hr style={{ margin: '1rem 0' }}/>
                                    <div>
                                      <Typography variant="h6" style={{marginBottom: '.5rem'}}>Votre expérience, vos certifications & diplômes</Typography>
                                      <Typography>
                                        Si vous possédez des certifications et/ou diplômes pour ce service, mettez les en avant ! Après vérification par My-Alfred, vous aurez le statut d’Alfred certifié et/ou diplômé sur ce service.
                                      </Typography>
                                      <Grid container style={{marginTop: '.5rem'}}>
                                        <Grid item xs={12}>
                                          <Typography style={{margin: '1rem 0', fontSize: 20, color: 'grey'}}>Nombre d'années d'expériences</Typography>
                                          <Select
                                            isClearable={true}
                                            placeholder="Vos années d'expériences"
                                            value={arrayHelpers.form.values.submission[index].experienceYears}
                                            options={[
                                              {value: '', label: "Aucune année d'expérience"},
                                              {value: 'ZeroOrOne', label: 'Entre 0 et 1 an'},
                                              {value: 'OneToFive', label: 'Entre 1 et 5 ans'},
                                              {value: 'FiveToTen', label: 'Entre 5 et 10 ans'},
                                              {value: 'MoreThanTen', label: 'Plus de 10 ans'},
                                            ]}
                                            onChange={async exp => {
                                              await arrayHelpers.form.setFieldValue(`submission[${index}].experienceYears`, exp);
                                            }}
                                            theme={theme => ({
                                              ...theme,
                                              colors: {
                                                ...theme.colors,
                                                primary: '#2FBCD3',
                                              }
                                            })}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Typography style={{margin: '1rem 0', fontSize: 20, color: 'grey'}}>Votre diplôme</Typography>
                                          {arrayHelpers.form.values.submission[index].diploma.label !== null && arrayHelpers.form.values.submission[index].diploma.year !== null && arrayHelpers.form.values.submission[index].diploma.diploma !== null ?
                                            <React.Fragment>
                                              <div style={{border: '1px solid lightgrey', width: '50%', textAlign: 'center', marginBottom: '1.5rem', position: 'relative'}}>
                                                <div onClick={() => {
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.diploma.label`, null);
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.diploma.year`, null);
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.diploma.diploma`, null);
                                                }
                                                } style={{position: 'absolute', top: 2, right: 2, cursor: 'pointer'}}><Clear color="secondary"/></div>
                                                <p>{arrayHelpers.form.values.submission[index].diploma.label} | {arrayHelpers.form.values.submission[index].diploma.year}</p>
                                              </div>
                                            </React.Fragment>
                                            : null
                                          }
                                          <ExpansionPanel>
                                            <ExpansionPanelSummary
                                              expandIcon={<ExpandMoreIcon />}
                                            >
                                              <Typography>Ajouter / modifier votre diplôme</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                              <Grid container>
                                                <Grid item xs={12}>
                                                  <TextField
                                                    value={this.state.diplomaName}
                                                    style={{width: '50%', marginRight: '5%'}}
                                                    className={classes.inputDiplomaCertifResp}
                                                    label="Nom du diplôme"
                                                    margin="dense"
                                                    variant="outlined"
                                                    onChange={() => {
                                                      this.setState({ diplomaName: event.target.value })
                                                    }}
                                                  />
                                                </Grid>
                                                <Grid item xs={12}>
                                                  <Field
                                                    name={`submission.${index}.diploma.year`}
                                                    render={({field}) => {
                                                      return (
                                                        <TextField
                                                          {...field}
                                                          value={field.value || ''}
                                                          style={{width: '50%', marginRight: '5%'}}
                                                          className={classes.inputDiplomaCertifResp}
                                                          label="Année d'obtention"
                                                          margin="dense"
                                                          variant="outlined"
                                                          select
                                                          InputLabelProps={{shrink: arrayHelpers.form.values.submission[index].diploma.year !== null}}
                                                        >
                                                          {dates.map(date => {
                                                            return <MenuItem key={date} style={{zIndex: 9999}} value={date}>{date}</MenuItem>
                                                          })}
                                                        </TextField>
                                                      )
                                                    }}
                                                  />
                                                </Grid>
                                                <Grid item xs={12}>
                                                  <label style={{display: 'inline-block', marginTop: 15}} className="forminputs">
                                                    Joindre mon diplôme
                                                    <input id="file" style={{width: '0.1px', height: '0.1px', opacity: 0, overflow: 'hidden'}} name="diploma" type="file" onChange={(event) => {
                                                      if (typeof event.currentTarget.files[0] === 'undefined') {

                                                      } else {
                                                        this.setState({ diplomaObj: event.currentTarget.files[0] })
                                                      }
                                                    }} className="form-control"
                                                    />
                                                  </label>
                                                  <span>{this.state.diplomaObj !== null ? this.state.diplomaObj.name : null}</span>
                                                  <p>En téléchargeant votre diplôme, votre diplôme aura le statut de diplôme vérifié auprès des utilisateurs mais il ne sera jamais visible par ses derniers</p>
                                                  <Button
                                                    variant="contained"
                                                    color="primary"
                                                    style={{color: 'white'}}
                                                    onClick={() => {
                                                      arrayHelpers.form.setFieldValue(`submission.${index}.diploma.label`, this.state.diplomaName);
                                                      arrayHelpers.form.setFieldValue(`submission.${index}.diploma.diploma`, this.state.diplomaObj);
                                                    }}
                                                    disabled={this.state.diplomaName === null || this.state.diplomaName === '' || arrayHelpers.form.values.submission[index].diploma.year === null || this.state.diplomaObj === null || arrayHelpers.form.values.submission[index].diploma.label !== null && arrayHelpers.form.values.submission[index].diploma.diploma !== null}
                                                  >Valider</Button>
                                                </Grid>
                                              </Grid>
                                            </ExpansionPanelDetails>
                                          </ExpansionPanel>
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Typography style={{margin: '1rem 0', fontSize: 20, color: 'grey'}}>Votre certification</Typography>
                                          {arrayHelpers.form.values.submission[index].certification.label !== null && arrayHelpers.form.values.submission[index].certification.year !== null && arrayHelpers.form.values.submission[index].certification.certification !== null ?
                                            <React.Fragment>
                                              <div style={{border: '1px solid lightgrey', width: '50%', textAlign: 'center', marginBottom: '1.5rem', position: 'relative'}}>
                                                <div onClick={() => {
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.certification.label`, null);
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.certification.year`, null);
                                                  arrayHelpers.form.setFieldValue(`submission.${index}.certification.certification`, null);
                                                }
                                                } style={{position: 'absolute', top: 2, right: 2, cursor: 'pointer'}}><Clear color="secondary"/></div>
                                                <p>{arrayHelpers.form.values.submission[index].certification.label} | {arrayHelpers.form.values.submission[index].certification.year}</p>
                                              </div>
                                            </React.Fragment>
                                            : null
                                          }
                                          <ExpansionPanel>
                                            <ExpansionPanelSummary
                                              expandIcon={<ExpandMoreIcon />}
                                            >
                                              <Typography>Ajouter / modifier votre certification</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                              <Grid container>
                                                <Grid item xs={12}>
                                                  <TextField
                                                    value={this.state.certifName}
                                                    onChange={() => {
                                                      this.setState({ certifName: event.target.value })
                                                    }}
                                                    style={{width: '50%', marginRight: '5%'}}
                                                    className={classes.inputDiplomaCertifResp}
                                                    label="Nom du certificat"
                                                    margin="dense"
                                                    variant="outlined"
                                                  />
                                                </Grid>
                                                <Grid item xs={12}>
                                                  <Field
                                                    name={`submission.${index}.certification.year`}
                                                    render={({field}) => {
                                                      return (
                                                        <TextField
                                                          {...field}
                                                          value={field.value}
                                                          style={{width: '50%', marginRight: '5%'}}
                                                          className={classes.inputDiplomaCertifResp}
                                                          label="Année d'obtention"
                                                          margin="dense"
                                                          variant="outlined"
                                                          select
                                                          InputLabelProps={{shrink: arrayHelpers.form.values.submission[index].certification.year !== null}}
                                                        >
                                                          {dates.map(date => {
                                                            return <MenuItem key={date} value={date}>{date}</MenuItem>
                                                          })}
                                                        </TextField>
                                                      )
                                                    }}
                                                  />
                                                </Grid>
                                                <Grid item xs={12}>
                                                  <label style={{display: 'inline-block', marginTop: 15}} className="forminputs">
                                                    Joindre ma certification
                                                    <input id="file" style={{width: '0.1px', height: '0.1px', opacity: 0, overflow: 'hidden'}} name="certification" type="file" onChange={(event) => {
                                                      if (typeof event.currentTarget.files[0] === 'undefined') {
                                                      } else {
                                                        this.setState({ certifObj: event.currentTarget.files[0] })
                                                      }
                                                    }} className="form-control"
                                                    />
                                                  </label>
                                                  <span>{this.state.certifObj !== null ? (typeof this.state.certifObj.name !== undefined ? this.state.certifObj.name : null) : null}</span>
                                                  <p>En téléchargeant votre certification, votre certification aura le statut de certification vérifiée auprès des utilisateurs mais elle ne sera jamais visible par ses derniers</p>
                                                  <Button
                                                    variant="contained"
                                                    color="primary"
                                                    style={{color: 'white'}}
                                                    onClick={() => {
                                                      arrayHelpers.form.setFieldValue(`submission.${index}.certification.label`, this.state.certifName);
                                                      arrayHelpers.form.setFieldValue(`submission.${index}.certification.certification`, this.state.certifObj);
                                                    }}
                                                    disabled={this.state.certifName === null || this.state.certifName === '' || arrayHelpers.form.values.submission[index].certification.year === null || this.state.certifObj === null || arrayHelpers.form.values.submission[index].diploma.label !== null && arrayHelpers.form.values.submission[index].diploma.diploma !== null}
                                                  >Valider</Button>
                                                </Grid>
                                              </Grid>
                                            </ExpansionPanelDetails>
                                          </ExpansionPanel>
                                        </Grid>
                                      </Grid>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </React.Fragment> : null
                      }}
                    />
                  </Grid>
                </Wizard.Page>
                <Wizard.Page>
                  <Field render={(arrayHelpers) => (
                    <Grid container style={{padding:'2%'}} className={classes.containercalendar}>
                      <Grid style={{width:'90%'}}>
                        <Schedule
                          availabilities={this.state.availabilities}
                          services={[[arrayHelpers.form.values.submission[0].serviceLabel, arrayHelpers.form.values.submission[0].serviceId]]}
                          cbAvailabilityCreated={this.availabilityCreated}
                        />
                      </Grid>
                    </Grid>
                  )} />
                </Wizard.Page>
              </Wizard>
            </div>
          </Grid>
          <Grid container className={classes.bottombar} justify="center" style={{backgroundColor: 'white',bottom:0, position:'fixed', zIndex:'999'}}>
            <Grid item xs={2} style={{textAlign:"center", borderBottom: '3px solid #4fbdd7'}}>
              <Link href={'/myShop/services'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/shopping-bag.png'} alt={'sign'} width={25} style={{opacity:'0.5'}}/></p></a>
              </Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
              <Link href={'/myShop/messages'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speech-bubble.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
              </a></Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
              <Link href={'/myShop/mesreservations'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/event.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
              </a></Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center",zIndex:999}}>
              <Link href={'/myShop/myAvailabilities'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/calendar.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
              </a></Link>
            </Grid>
            <Grid item xs={2} style={{textAlign:"center"}}>
              <Link href={'/myShop/performances'}><a style={{textDecoration:'none'}}>
                <p style={{color: "white",cursor: 'pointer'}}><img src={'../static/speedometer.png'} alt={'sign'} width={25} style={{opacity:'0.7'}}/></p>
              </a></Link>
            </Grid>
          </Grid>
        <Footer/>
      </Layout>
        );
    };
}

export function FormSelect(props) {
  if (props.ready === 1) {
    return (
      <React.Fragment>
        <Field name={props.fieldName}>
          {({ field, form }) => {
            return (
              props.option.map((select, index) => {
                return (
                  <MultipleSelect
                    key={select.value}
                    option={props.option[index]}
                    value={field.value}
                    update={async select => {
                      await form.setFieldValue(`${props.fieldName}s.${index}`, select)
                    }}
                  />
                )
              })
            )
          }}
        </Field>
        {props.handleFunction === null ? null :
          <Field>
            {({ form }) => {
              return (
                form.values[`${props.fieldName}s`] !== '' ?
                  <button
                    type="button"
                    onClick={() => {
                      if (form.values[`${props.fieldName}s`] !== '' && form.values[`${props.fieldName}s`] != null) {
                        props.handleFunction(form.values[`${props.fieldName}s`]);
                      }
                    }}
                  >Valider {props.fieldName}</button>
                  : null
              )
            }}
          </Field>
        }
      </React.Fragment>
    )
  } else {
    return null;
  }
}

export function CheckboxSelect(props) {
  if (props.ready === 1) {
    return (
      <React.Fragment>
        <Field name={props.fieldName}>
          {({ form }) => {
            return (
              props.option.map((select, index) => {
                return (
                  <React.Fragment key={index}>
                    <p>Prestation(s) pour : {select.serviceLabel} ({select.filterLabel})</p>
                    <label>
                      {select.label}
                      <input
                        value={select.label}
                        type="checkbox"
                        checked={select.checked}
                        onChange={() => {
                          props.update(index);
                          if (form.values.prestations.includes(select.label)) {
                            const nextValue = form.values.prestations.filter(
                              value => value !== select.label
                            );
                            form.values.prestations = nextValue;
                          } else {
                            const nextValue = form.values.prestations.concat(select.label);
                            form.values.prestations = nextValue;
                          }
                        }}
                      />
                    </label>
                  </React.Fragment>
                )
              })
            )
          }}
        </Field>
      </React.Fragment>
    )
  } else {
    return null;
  }
}


const Bar = styled.div`
  position: relative;
  height: 10px;
  width: 100%;
  border-radius: 3px;
`;

const Fill = styled.div`
  background: #2FBCD3;
  height: 100%;
  border-radius: inherit;
  transition: width .2s ease-in;
  width: ${props => props.width};
`;

export default withStyles(styles)(addService);

