'use client'
import { React, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './styles.module.css'

const Team = () => {

  // Get the constructor/team ID from slug
  const teamId = useParams()['slug'];

  // Get season
  const season = 2021;

  // Set states for team & drivers for team
  const [team, setTeam] = useState({ constructorId: '', name: '', url: '', nationality: ''});
  const [teamDrivers, setTeamDrivers] = useState([]);
  const [teamRaces, setTeamRaces] = useState([]);
  const [teamResults, setTeamResults] = useState([]);
  const [lastYearTeamResults, setLastYearTeamResults] = useState([]);
  const [total, setTotal] = useState();
  const [topScoringRace, setTopScoringRace] = useState({raceName: '', driver: '', score: '', position: '', status: ''});
  const [bottomScoringRace, setBottomScoringRace] = useState({raceName: '', driver: '', score: '', position: '', status: ''});

  // Initialize URLs for API requests
  const teamUrl = `http://ergast.com/api/f1/${season}/constructors/${teamId}.json`;
  const teamDriversUrl = `https://ergast.com/api/f1/${season}/constructors/${teamId}/drivers.json`
  const teamResultsUrl = `http://ergast.com/api/f1/${season}/constructors/${teamId}/results.json`

  const lastSeason = 2021-1;
  const teamResultsLastYearUrl = `http://ergast.com/api/f1/${lastSeason}/constructors/${teamId}/results.json`

  // Fetch team data from API asyncronously
  useEffect(() => {
    const getTeam = async function fetchTeamDataFromURL() {
      try {
        const response = await fetch(teamUrl);

        // Now turn data into a json readable format
        const data = await response.json();
        const constructor = data['MRData']['ConstructorTable']['Constructors'][0];

        if (constructor) {
          setTeam(
            prevState => ({
              ...prevState,
              constructorId: constructor.constructorId,
              name: constructor.name,
              url: constructor.url,
              nationality: constructor.nationality
          }));
          console.log(team);
        } else {
          console.log('No constructors/teams found');
        }
        

      } catch (error) {
        // Error from API fetch
        console.error('Request failed', error);
      }
    };

    // Fetch team driver data from API asyncronously
    const getTeamDrivers = async function fetchDriversDataFromURL() {
      try {
        const response = await fetch(teamDriversUrl);

        // Now turn data into a json readable format
        const data = await response.json();
        console.log(data);
        setTeamDrivers(data['MRData']['DriverTable']['Drivers']);
        console.log(data['MRData']['DriverTable']['Drivers']);
        console.log(teamDrivers);

      } catch (error) {
        // Error from API fetch
        console.error('Request failed', error);
      }
    };

    // Fetch team results from API asyncronously
    const getResults = async function fetchResultsDataFromURL() {
      try {
        const response = await fetch(teamResultsUrl);

        // Now turn data into a json readable format
        const data = await response.json();

        // Get races from data
        const races = data['MRData']['RaceTable']['Races'];
        setTeamRaces(races);

        // Declare total points for constructor 
        let totalPoints = 0;

        // Now get highest & lowerst scoring races
        let highestScore = 0;
        let highestScoreRace = '';
        let highestScoreDriver = '';
        let highestScorePosition = '';
        let highestScoreStatus = '';

        let lowestScore = 100;
        let lowestScoreRace = '';
        let lowestScoreDriver = '';
        let lowestScorePosition = '';
        let lowestScoreStatus = '';

        //Results
        let results = [];
        console.log(races[0]['Results']);

        for (let i = 0; i < races.length; i++) {

            results.push(races[i]['Results']);

            totalPoints += races[i]['Results'].reduce( function(prev, current){
              console.log(`prev = ${prev}, current = ${current['points']}`);
              return parseInt(prev) + parseInt(current['points']);
            }, 0);


            const highestResult = races[i]['Results'].reduce(function(prev, current) {
              totalPoints += parseInt(current.points);
              console.log(totalPoints);

              if (+current.points > +prev.points) {
                  return current;
              } else {
                  return prev;
              }
              
            });

            if (highestResult.points > highestScore) {
                highestScore = highestResult.points;
                highestScoreRace = races[i].raceName;
                highestScoreDriver = highestResult.Driver.familyName;
                highestScorePosition = highestResult.position;
                highestScoreStatus = highestResult.status;
            }
            

            const lowestResult = races[i]['Results'].reduce(function(prev, current) {
              if (+current.points < +prev.points) {
                  return current;
              } else {
                  return prev;
              }
            });

            if (lowestResult.points < lowestScore) {
                lowestScore = lowestResult.points;
                lowestScoreRace = races[i].raceName;
                lowestScoreDriver = lowestResult.Driver.familyName;
                lowestScorePosition = lowestResult.position;
                lowestScoreStatus = lowestResult.status;
            }

        }

        console.log('Results:');
        console.log(results);

        // Set total using accumulated points
        setTotal(totalPoints);

        // Set top scoring race stat
        setTopScoringRace(
          prevState => ({
            ...prevState,
            raceName: highestScoreRace, 
            driver: highestScoreDriver, 
            score: highestScore, 
            position: highestScorePosition,
            status: highestScoreStatus
        }));

        // Set bottom scoring race stat
        setBottomScoringRace(
            prevState => ({
              ...prevState,
              raceName: lowestScoreRace, 
              driver: lowestScoreDriver, 
              score: lowestScore, 
              position: lowestScorePosition,
              status: lowestScoreStatus
        }));

        // Now get individual results for races
        console.log(races);
        console.log(results);

      } catch (error) {
        // Error from API fetch
        console.error('Request failed', error);
      }
    };

    const getLastYearResults = async function fetchLastYearResultsDataFromURL() {
      try {
        const response = await fetch(teamResultsLastYearUrl);

        // Now turn data into a json readable format
        const data = await response.json();
        const lastYearRaces = data['MRData']['RaceTable']['Races'];
        console.log(lastYearRaces);

        let resultArray = [];

        for (let i = 0; i < lastYearRaces.length; i++) {
          for (let j = 0; j < lastYearRaces[i]['Results'].length; j++)
          {
            resultArray.push(lastYearRaces[i]['Results'][j]['points']);
            //setlastYearTeamResults([...lastYearTeamResults, lastYearRaces[i]['Results'][j]['points']]); //simple value
          }
        };

        setLastYearTeamResults(resultArray);
        console.log(lastYearTeamResults);

      } catch (error) {
        // Error from API fetch
        console.error('Request failed', error);
      }
    };


    getTeam();
    getTeamDrivers();
    getResults();
    getLastYearResults();
  }, []);

  return (
    <div className={`${styles.team} container`}>
      <h1>{team.name}, <span className={styles.nationality}>{team.nationality}</span></h1>
      <a href={team.url} target='_blank'>View on Wikipedia</a>
      <div className={styles.seasonTitle}>
        <h2>{season} Season</h2>
      </div>
      <div className={styles.drivers}>
        <h2>Drivers</h2>
        <ul>
        {teamDrivers.map((teamDriver) => (
          <li key={teamDriver.driverId}>
            <a href={teamDriver.url} target='_blank'>{teamDriver.givenName} {teamDriver.familyName}</a>
          </li>
        ))}
        </ul>
      </div>
      <div className='row'>
        <h2>Stats</h2>
      </div>
      <div className={styles.stats}>
        <div className='row'>
          <div className='col-md-3 col-sm-6'>
            <div className={styles.stat}>
              <h3>Total Points</h3>
              <p>{total}</p>
            </div>
          </div>
          <div className='col-md-3 col-sm-6'>
            <div className={styles.stat}>
              <h3>Races:</h3>
              <ul className='races'>
                {teamRaces.map((race) => (
                  <li key={race.raceName}>
                    {race.raceName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='col-md-3 col-sm-6'>
            <div className={styles.stat}>
              <h3>Top Scoring Race</h3>
              <p>Race: {topScoringRace.raceName}</p>
              <p>Driver: {topScoringRace.driver}</p>
              <p>Score: {topScoringRace.score}</p>
              <p>Position: {topScoringRace.position}</p>
              <p>Status: {topScoringRace.status}</p>
            </div>
          </div>
          <div className='col-md-3 col-sm-6'>
            <div className={styles.stat}>
              <h3>Lowest Scoring Race</h3>
              <p>Race: {bottomScoringRace.raceName}</p>
              <p>Driver: {bottomScoringRace.driver}</p>
              <p>Score: {bottomScoringRace.score}</p>
              <p>Position: {bottomScoringRace.position}</p>
              <p>Status: {bottomScoringRace.status}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.previousData}>
        <div className='row'>
          <div className='col-sm-6'>
            <div className={styles.previousYearsChampionship}>
              <p>Previous Year Championship Points</p>
              <ul className='points'>
                {lastYearTeamResults.map((result) => (
                  <li key={result}>
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='col-sm-6'>
            <div className={styles.previousMatchBestFinishPosition}>
              <p>Previous Match Best Finish Position</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
