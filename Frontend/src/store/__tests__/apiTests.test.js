import axios from 'axios';
import { fetchAllCountries } from '../countriesSlice';

jest.mock('axios');

describe('fetchAllCountries API call', () => {
  it('fetches successfully data from API', async () => {
    const mockData = [
      { name: { common: 'Canada' }, cca3: 'CAN' }
    ];
    
    axios.get.mockResolvedValue({ data: mockData });
    
    const dispatch = jest.fn();
    const getState = jest.fn();
    
    await fetchAllCountries()(dispatch, getState, undefined);
    
    expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchAllCountries.pending.type
      })
    );
    
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchAllCountries.fulfilled.type,
        payload: mockData
      })
    );
  });

  it('handles API errors', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue(new Error(errorMessage));
    
    const dispatch = jest.fn();
    const getState = jest.fn();
    
    await fetchAllCountries()(dispatch, getState, undefined);
    
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchAllCountries.rejected.type,
        error: expect.objectContaining({
          message: errorMessage
        })
      })
    );
  });
});