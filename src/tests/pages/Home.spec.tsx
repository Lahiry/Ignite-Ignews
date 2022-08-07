import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe' 
import Home, { getStaticProps } from '../../pages'

jest.mock('next/router')
jest.mock('next-auth/react', () => {
  return {
    useSession: () => [null, false]
  }
})
jest.mock('../../services/stripe')

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{priceId: 'face-price-id', amount: 'fake-amount'}} />)

    expect(screen.getByText('for fake-amount month')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const retrieveStripePricesMocked = jest.mocked(stripe.prices.retrieve)

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$10.00'
          }
        }
      })
    )
  })
})