import React from 'react'
import { Calendar, Views, momentLocalizer   } from 'react-big-calendar';
import _ from 'lodash'
import moment from 'moment';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DateFnsUtils from '@date-io/date-fns';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import withStyles from '@material-ui/core/styles/withStyles';
import Chip from '@material-ui/core/Chip';
import frLocale from "date-fns/locale/fr";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {availabilities2events, eventUI2availability, availability2eventUI, LONG_DAYS} from '../../utils/converters';
import { isAlfredDateAvailable, hasAlfredDateEvent } from '../../utils/dateutils';
import {ALL_SERVICES, GID_LEN} from '../../utils/consts.js';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Typography } from '@material-ui/core'; // Import css
import styles from './ScheduleStyle'
import PropTypes from 'prop-types';

const localizer = momentLocalizer(moment);

const formats = {
  timeGutterFormat : 'HH:mm', // Axe Y horaires week/day
  eventTimeRangeFormat: ({
    start,
    end
  }, culture, local) =>
    local.format(start, 'HH:mm', culture) + ' - ' + // Affichage de l'event dans le calendrier h début (week/day)
    local.format(end, 'HH:mm', culture), // Affichage de l'event dans le calendrier h fin (week/day)
  dayFormat: 'ddd' + ' ' + 'DD' , // header de weekly (lun. dd/mm) (week)
  agendaTimeRangeFormat: ({
    start,
    end
  }, culture, local) =>
    local.format(start, 'HH:mm', culture) + ' - ' + // Affichage de l'event dans Agenda - Horaires h début (agenda)
    local.format(end, 'HH:mm', culture), // Affichage de l'event dans Agenda - Horaires h fin (agenda)
  agendaDateFormat: 'ddd' + ' ' + 'DD/MM', // Affichage de l'event dans agenda - Date format (ddd. DD/MM) (agenda)
  dayRangeHeaderFormat: ({
    start,
    end
  }, culture, local) =>
    local.format(start,  'MMM' + ' ' + 'YYYY', culture) + // Title de week - date début (week)
    local.format(end,  '' + ' ' + '', culture),// Title de week - date fin (week)
  dayHeaderFormat: 'dddd DD MMMM'
};




class Schedule extends React.Component {
  EMPTY_AVAIL = {
    // Availability data
    servicesSelected:[ALL_SERVICES],
    _id: null,
    selectedDateStart: null,
    selectedTimeStart: null,
    selectedDateEnd: null,
    selectedTimeEnd: null,
    selectedDateEndRecu: null,
    // Days (1=>7)
    recurrDays: new Set(),
  };

  constructor(props) {
    super(props);

    this.state = {
      events: _.cloneDeep(this.props.events),
      title: '',
      addClass: 'labelSelectorActive',
      eventsSelected: [],
      isModalOpen: false,
      dayLayoutAlgorithm: 'no-overlap',
      isExpanded: true,
      services: [ALL_SERVICES, ...this.props.services] || [ALL_SERVICES],
      ...this.EMPTY_AVAIL,
      view : Views.MONTH,
    };
    this.resetData();
  }

  resetData = () => {
    this.setState(this.EMPTY_AVAIL)
  };
  /**
    On peut envoyer si service(s) sélectionné(s), date/heure début et fin saisis
    et, si récurrence, au moins un jour sélectionné
  */
  isButtonSendEnabled() {
    let enabled=this.state.servicesSelected.length>0;
    enabled = enabled && this.state.selectedDateStart && this.state.selectedTimeStart && this.state.selectedDateEnd && this.state.selectedTimeEnd;
    enabled = enabled && (!this.state.isExpanded || this.state.recurrDays.size>0);
    return enabled;
  }

  toggleRecurrDay(item) {
    this.state.recurrDays.has(item) ? this.removeRecurrDay(item) : this.addRecurrDay(item);
  }

  addRecurrDay(item) {
    this.setState(({ recurrDays }) => ({
      recurrDays: new Set(recurrDays).add(item)
    }));
  }

  removeRecurrDay(item) {
    this.setState(({ recurrDays }) => {
      const newChecked = new Set(recurrDays);
      newChecked.delete(item);

      return {
       recurrDays: newChecked
      };
    });
  }


  onChangeServices = e => {
    let all_serv = e.target.value.filter(serv => serv[0]===ALL_SERVICES[0]);
    let contains = all_serv.length>0;
    if (contains) {
      this.setState({servicesSelected: [ALL_SERVICES]});
    }
    else {
      this.setState({servicesSelected: e.target.value });
    }
  };

  toggleAddModal =  ({ start, end })  => {
    if (!this.props.onCreateAvailability) {
      return
    }
    var dt = new Date(start);
    dt.setMonth( dt.getMonth() + 6 );
      this.setState({
        _id : null,
        selectedDateStart: start,
        selectedDateEnd: end,
        selectedTimeStart: start.toLocaleTimeString("fr-FR", {hour12: false}).slice(0, 5),
        selectedTimeEnd: end.toLocaleTimeString("fr-FR", {hour12: false}).slice(0, 5),
        selectedDateEndRecu: dt,
        servicesSelected: [ALL_SERVICES],
        isModalOpen: !this.state.isModalOpen,
        recurrDays: new Set([0, 1, 2, 3, 4 , 5])
      }, () => { console.log(`Id:${this.state._id}`)});

  };

  toggleEditModal = event => {
    if (!this.props.onUpdateAvailability) {
      return
    }
    var avail=this.props.availabilities.filter( a => a._id === event._id);
    if (avail.length === 0) {
      return
    }
    avail = avail[0];

    const eventUI = availability2eventUI(avail);

    this.setState({...eventUI, isModalOpen: true});

    if (!this.state.isModalOpen) {
      this.setState({
        isModalOpen: !this.state.isModalOpen,
      });
    }
  };

   handleChange = () =>{
     this.setState({isExpanded: !this.state.isExpanded});
     if (this.state.isExpanded && this.state.recurrDays.size===0 && this.state.selectedDateStart ) {
       let dayOfWeek = new Date(this.state.selectedDateStart).getDay();
       dayOfWeek = (dayOfWeek+6)%7;
       this.setState({recurrDays: new Set([dayOfWeek])});
     }
   };

   handleCancel = () => {
     this.resetData();
     this.closeModal()
   };

   handleDateStartChange = date => {
     this.setState({selectedDateStart: new Date(date)})
     // End date is start date with end time
     var newDateEnd = new Date(date)
     let hours = parseInt(this.state.selectedTimeEnd.substring(0,2))
     let minutes = parseInt(this.state.selectedTimeEnd.substring(3,5))
     newDateEnd.setHours(hours);
     newDateEnd.setMinutes(minutes);
     this.setState({selectedDateEnd: newDateEnd});
   };

  handleDateEndChange = date => {
    this.setState({selectedDateEnd: date});
  };

  handleTimeStartChange = time =>{
    let hours = parseInt(time.target.value.substring(0,2));
    let minutes = parseInt(time.target.value.substring(3,5));
    this.setState({selectedTimeStart: time.target.value});
    this.state.selectedDateStart.setHours(hours);
    this.state.selectedDateStart.setMinutes(minutes);
  };

  handleTimeEndChange = time =>{
    let hours = parseInt(time.target.value.substring(0,2));
    let minutes = parseInt(time.target.value.substring(3,5));
    this.setState({selectedTimeEnd: time.target.value});
    this.state.selectedDateEnd.setHours(hours);
    this.state.selectedDateEnd.setMinutes(minutes);
  };

  handleDateEndChangeRecu = date => {
    this.setState({ selectedDateEndRecu: date });
  };

  onSubmit = e => {
    let avail=eventUI2availability(this.state);
    if (this.state._id==null) { // Modif
      this.props.onCreateAvailability(avail);
    }
    else {
      this.props.onUpdateAvailability(avail);
    }
    this.closeModal();
    this.resetData()
  };

  onDelete = e => {
    let avail=eventUI2availability(this.state);
    this.closeModal();
  };

  closeModal = () =>{
    this.setState({isModalOpen: false})
  };

  selectedEvent = (event) =>{
    let alfredAvailable = isAlfredDateAvailable(event);
    let hasDateEvent = hasAlfredDateEvent(event);

  };

  selectSlot = ({start, end, action}) =>{
    let alfredAvailable = isAlfredDateAvailable(start);
    let hasDateEvent = hasAlfredDateEvent(start);
    let array = Object.values(this.state.eventsSelected);

   this.setState( {eventsSelected:[...this.state.eventsSelected, start]}, () => console.log(`Selected events: ${this.state.eventsSelected}`))
  };

  availAsText = () => {
    const {selectedDateStart, selectedTimeStart, selectedTimeEnd, selectedDateEndRecu, recurrDays, isExpanded} = this.state;
    let value = "Disponible de "+selectedTimeStart+ " à "+selectedTimeEnd;
    value += (isExpanded ? " à partir du " : " le ")+moment(selectedDateStart).format('DD/MM/YY');
    if (isExpanded && selectedDateEndRecu) {
      value += " jusqu'au "+moment(selectedDateEndRecu).format('DD/MM/YY')
    }
    if (isExpanded) {
      value += " tous les ";
      let count=0;
      for (var i = 0; i<7; i++) {
        if (recurrDays.has(i)) {
          value += LONG_DAYS[i]+(count <recurrDays.size-2 ? ", " : count === recurrDays.size-1 ? "" : " et ");
          count++
        }
      }
    }
    return value
  };

  customToolbar = (toolbar) => {

    const label = () => {
      const date = moment(toolbar.date);
      return (
          <span>
          <span>{date.format('MMMM')}</span>
          <span> {date.format('YYYY')}</span>
        </span>
      );
    };

    return (
        <Grid container>
          <Grid style={{display:'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', marginBottom : 20, }}>
            <Grid>
              <label>{label()}</label>
            </Grid>
          </Grid>
        </Grid >
    );
  };

  changeClasses = (classes) => {
    console.log(classes, 'classes')
      this.setState({addClass: 'Schedule-labelSelectorActive-85'});

  }

  render() {
    const { classes, title, subtitle, selectable, height, nbSchedule } = this.props;
    const { view, addClass } = this.state;

    const txt = this.availAsText();
    let events = availabilities2events(this.props.availabilities);


    if (view === Views.MONTH) {
      let known_dates = [];
      events = events.filter ( e => {
        const dateStr = moment(e.start).format('DD/MM/YYYY');
        if (known_dates.includes(dateStr)) {
          return false
        }
        known_dates.push(dateStr);
        return true
      })
    }

    const CustomMonthDateHeader = (event) =>{
      if(event.isOffRange){
        return null
      }else{
        return(
            <Grid className={addClass} onClick={() => this.changeClasses(classes)}>
              <p style={{margin: 0, cursor:'pointer'}}>{event.label}</p>
            </Grid>
        )
      }
    };

    const MyDateCellWrapper = (event) =>{
      let propsStyle = event.children.props['className'];

      if(propsStyle === 'rbc-day-bg rbc-off-range-bg'){
        return(
            <Grid style={{width: '100%', height :'100%', borderLeft:'1px solid #DDD', backgroundColor: 'white', zIndex:5}}/>
        )
      }
      if(propsStyle === 'rbc-day-bg rbc-today'){
        return (
            <Grid onClick={() => this.selectSlot} style={{width: '100%', height :'100%', borderLeft:'1px solid #DDD', backgroundColor: 'rgba(79, 189, 215, 0.2)', cursor:'pointer'}}/>
        )
      }else{
        return(
            <Grid onClick={() => this.selectSlot} style={{width: '100%', height :'100%', borderLeft:'1px solid #DDD', cursor:'pointer'}}/>
        )
      }
    };

    const MyEventWrapper = (event) =>{

       return(
            <Grid
                style={{
                  borderTop : '25px solid pink',
                  borderRight: '25px solid transparent',
                  height : 0,
                  width : 0,
                  borderRadius: 0,
                  padding: 0,
                  margin: 0,
                  marginLeft: 1
            }}/>
        )
    };

    return (
      <Grid className={classes.heightContainer} style={{height: height}} >
        { title || subtitle  ?
          <Grid style={{ marginBottom: 50 }}>
            { title ?
              <Grid>
                <Typography className={classes.policySizeTitle}>{title}</Typography>
              </Grid> : null
            }
            { subtitle ?
              <Grid>
                <p className={classes.policySizeContent}>{subtitle}</p>
              </Grid> : null
            }
          </Grid>
          : null
        }
        <Grid container spacing={2}>
          {[...Array(nbSchedule)].map((x, i) =>{
            let date = new Date();
            let month = new Date(date.setMonth(date.getMonth() + (i-3)));
              return(
                <Grid item xl={4} lg={5} xs={12} style={{height: 500}}>
                  <Calendar
                      selectable={selectable}
                      popup={false}
                      culture='fr-FR'
                      localizer={localizer}
                      // FIX: use state instead of props
                      events={events}
                      views={[this.state.view]}
                      defaultDate={month}
                      onSelectSlot={this.selectSlot}
                      onSelectEvent={this.selectedEvent}
                      dayLayoutAlgorithm={this.state.dayLayoutAlgorithm}
                      messages={{
                        'today': "Aujourd'hui",
                        "previous":'<',
                        "next":">",
                        "month": "Mois",
                        "week": "Semaine",
                        "day": "Aujourd'hui",
                        "agenda": "Agenda",
                        "event" :"Evénement",
                        "date" : "Date",
                        "time" : "Horaires",
                        'noEventsInRange': 'Aucun évènement dans cette période',
                      }}
                      formats={formats}
                      className={classes.sizeSchedulle}
                      components={{
                        toolbar: this.customToolbar,
                        //event: MyEvent, // used by each view (Month, Day, Week)
                        eventWrapper: MyEventWrapper,
                        //eventContainerWrapper: MyEventContainerWrapper,
                        //dayWrapper: MyDayWrapper,
                        dateCellWrapper: MyDateCellWrapper,
                        //timeSlotWrapper: MyTimeSlotWrapper,
                        //timeGutterHeader: MyTimeGutterWrapper,
                        month:{
                          dateHeader: CustomMonthDateHeader,
                          //header: MyMonthHeader,
                          //event: MyMonthEvent,
                        }
                      }}
                  />
                </Grid>
              )
          }
          )}
        </Grid>
        {/*<Modal
          closeAfterTransition
          BackdropProps={{
            timeout: 500,
          }}
          open={this.state.isModalOpen}
          onClose={this.closeModal}
        >
          <Fade in={this.state.isModalOpen}>
            <Grid container className={classes.modalContainer}>
              <Grid container>
                  <Grid>
                    <h2>{ this.state._id==null ? `Nouvelle disponibilité` : `Modifier disponibilité`}</h2>
                  </Grid>
              </Grid>
              <Grid container>
                  <Grid>
                    { txt }
                  </Grid>
              </Grid>
              <Grid container style={{justifyContent: 'center'}}>
                <form>
                  <Grid className={classes.contentTimeSlot}>
                    <Grid style={{width: '100%'}}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                        <Grid className={classes.contentDateAndTime}>
                          <Grid>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                id="date-picker-inline"
                                label={ this.state.isExpanded  ? "Date de début" : "Date" }
                                className={classes.formSchedule}
                                value={this.state.selectedDateStart}
                                onChange={this.handleDateStartChange}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                autoOk={true}
                            />
                          </Grid>
                          <Grid>
                            <TextField
                                id="time"
                                label="Heure de début"
                                type="time"
                                defaultValue={this.state.selectedTimeStart}
                                onChange={this.handleTimeStartChange}
                                className={classes.textField}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  step: 300, // 5 min
                                }}
                            />
                          </Grid>
                        </Grid>
                        <Grid className={classes.contentEndTime}>
                          <TextField
                            id="time"
                            label="Heure de fin"
                            type="time"
                            className={classes.textField}
                            defaultValue={this.state.selectedTimeEnd}
                            onChange={this.handleTimeEndChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            inputProps={{
                              step: 300, // 5 min
                            }}
                          />
                        </Grid>
                      </MuiPickersUtilsProvider>
                    </Grid>
                  </Grid>
                  <Grid container className={classes.containerRecurrence}>
                    <ExpansionPanel expanded={this.state.isExpanded} style={{width:'100%'}}>
                      <ExpansionPanelSummary>
                        <FormControlLabel
                          aria-label="Acknowledge"
                          onClick={event => event.stopPropagation()}
                          onFocus={event => event.stopPropagation()}
                          control={<Checkbox />}
                          label="Répéter tous les"
                          onChange={this.handleChange}
                          checked={this.state.isExpanded}
                        />
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.panelForm}>
                        <Grid container className={classes.panelFormDays}>
                          {[0,1,2,3,4,5,6].map( d => {
                            return (<Chip
                              clickable
                              label={DAYS[d]}
                              color={this.state.recurrDays.has(d) ? 'secondary' :  ''}
                              className={this.state.recurrDays.has(d) ? classes.textFieldChips : classes.test}
                              onClick={() => {
                                  this.toggleRecurrDay(d);
                              }
                            } />)
                          })}
                        </Grid>
                        <Grid container className={classes.panelFormRecu}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                id="date-picker-inline"
                                label="jusqu'au"
                                className={classes.textField}
                                value={this.state.selectedDateEndRecu}
                                onChange={this.handleDateEndChangeRecu}
                                KeyboardButtonProps={{
                                  'aria-label': 'change date',
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                autoOk={true}
                              />
                         </MuiPickersUtilsProvider>
                        </Grid>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Grid>
                  <Grid container justify="flex-end" style={{marginTop: 20}}>
                    <Button type="button" variant="contained" className={classes.textFieldButton} color={'secondary'} onClick={() => this.handleCancel()} >Annuler </Button>
                    <Button type="button" disabled={!this.isButtonSendEnabled()} variant="contained" className={classes.textFieldButton} color={'primary'}  onClick={() => this.onSubmit()}>
                      { this.state._id==null ? `Ajouter` : `Modifier` }
                    </Button>
                    { this.props.onDeleteAvailability && this.state._id!=null ?
                        <Button type="button" variant="contained" className={classes.textFieldButton} color={'primary'}  onClick={() => this.onDelete()}>Supprimer </Button>
                        :
                        null
                    }
                  </Grid>
                </form>
              </Grid>
            </Grid>
        </Fade>
      </Modal>*/}
    </Grid>
    )
  }
}

Schedule.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default  withStyles(styles, { withTheme: true }) (Schedule);
