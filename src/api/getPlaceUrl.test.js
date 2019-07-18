import { getPlaceUrl } from './getPlaceUrl.js';

const placeAndLabelsArray = [
  { name: 'playground 1', place_id: 'p1' },
  { name: 'cafe 1', place_id: 'c1' },
];

describe('getPlaceUrl', () => {
  it('returns places array with correctly formatted urls added', () => {
    const returnValue = [
      {
        name: 'playground 1',
        place_id: 'p1',
        url:
          'https://www.google.com/maps/search/?api=1&query=playground+1&query_place_id=p1',
      },
      {
        name: 'cafe 1',
        place_id: 'c1',
        url:
          'https://www.google.com/maps/search/?api=1&query=cafe+1&query_place_id=c1',
      },
    ];
    const placesArrayWithUrls = getPlaceUrl(placeAndLabelsArray);
    expect(placesArrayWithUrls).toEqual(returnValue);
  });
});
