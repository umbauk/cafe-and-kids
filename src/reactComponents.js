import React, { useState } from 'react';
import {
  Card,
  CardText,
  CardBody,
  CardTitle,
  Button,
  Table,
  Popover,
  PopoverHeader,
  PopoverBody,
} from 'reactstrap';

export const Logo = ({ subtitle }) => (
  <CardTitle>
    <div id='cafe-and-kids'>
      <a href='/'>Cafe and Kids</a>
    </div>
    {subtitle && <div id='subtitle'>{subtitle}</div>}
  </CardTitle>
);

export const About = props => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggle = () => setPopoverOpen(!popoverOpen);

  return (
    <div>
      <Button id='about' type='button'>
        About
      </Button>
      <Popover
        placement='auto'
        trigger='legacy'
        isOpen={popoverOpen}
        target='about'
        toggle={toggle}
      >
        <PopoverHeader>About</PopoverHeader>
        <PopoverBody>
          cafeandkids.com was designed and built by Darren Greenfield as a project to help him learn
          to code. It solved a problem he constantly had: what to do with his two young girls to
          keep them happy and where to find good coffee to keep him happy!{' '}
          <div className='spacer' />
          You can read more about him in his{' '}
          <a href='https://medium.com/@darren.g' target='_blank' rel='noopener noreferrer'>
            Medium blog posts
          </a>{' '}
          , check out his personal website at
          <a href='https://darrengreenfield.com' target='_blank' rel='noopener noreferrer'>
            darrengreenfield.com
          </a>
          , or contact him at{' '}
          <a href='mailto:darren.greenfield@gmail.com'>darren.greenfield@gmail.com</a>
        </PopoverBody>
      </Popover>
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
