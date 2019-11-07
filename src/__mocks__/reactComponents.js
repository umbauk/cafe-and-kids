// Mocks <About> to remove Popover which causes issues with target 'about' not being found on DOM

import React from 'react';
import { Card, CardText, CardBody, CardTitle, Button, Table } from 'reactstrap';

export const Logo = ({ subtitle }) => (
  <CardTitle>
    <div id='cafe-and-kids'>
      <a href='/'>Cafe and Kids</a>
    </div>
    {subtitle && <div id='subtitle'>{subtitle}</div>}
  </CardTitle>
);

export const About = props => {
  return (
    <div>
      <Button id='about' type='button'>
        About
      </Button>
    </div>
  );
};

export const CardTable = ({ cardId, cardText, tableId, placeResultsArray }) => (
  <Card id={cardId}>
    <CardBody className='results-table-body'>
      <CardText className='table-title'>{cardText}</CardText>
      {placeResultsArray && <ResultsTable id={tableId} placeResultsArray={placeResultsArray} />}
    </CardBody>
  </Card>
);

export const ResultsTable = ({ placeResultsArray }) => (
  <Table borderless>
    <thead>
      <tr>
        <th>
          <center>Label</center>
        </th>
        <th>Place name</th>
        <th>
          <center>Rating</center>
        </th>
      </tr>
    </thead>
    <tbody>
      {placeResultsArray.map(place => [
        <tr key={place.kidsPlace.label}>
          <th scope='row' className='green-text'>
            <center>{place.kidsPlace.label}</center>
          </th>
          <td>
            <a target='_blank' rel='noopener noreferrer' href={place.kidsPlace.url}>
              {place.kidsPlace.name}
            </a>
          </td>
          <td>
            <center>{place.kidsPlace.rating}</center>
          </td>
        </tr>,
        <tr key={place.cafe.label}>
          <th scope='row' className='red-text'>
            <center>{place.cafe.label}</center>
          </th>
          <td>
            <a target='_blank' rel='noopener noreferrer' href={place.cafe.url}>
              {place.cafe.name}
            </a>
          </td>
          <td>
            <center>{place.cafe.rating}</center>
          </td>
        </tr>,
        <tr className='blank-row' key={place.cafe.label + place.kidsPlace.label}>
          <td colSpan='3'></td>
        </tr>,
      ])}
    </tbody>
  </Table>
);
