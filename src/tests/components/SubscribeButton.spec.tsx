import { fireEvent, render, screen } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SubscribeButton } from '../../components/SubscribeButton';

jest.mock('next-auth/react')
jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({ data: null, status: 'unauthenticated' })

    render(<SubscribeButton />)
  
    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
    
  })

  it('redirects user to sign in when not authenticated', () => {
    const signInMocked = jest.mocked(signIn)

    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({ data: null, status: 'unauthenticated' })

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')
  
    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects to post when user is authenticated', () => {
    const useRouterMocked = jest.mocked(useRouter)
    const useSessionMocked = jest.mocked(useSession)
    const pushMocked = jest.fn()

    useSessionMocked.mockReturnValueOnce({
      data: {
        user : {
          name: "John Doe",
          email: "john.doe@example.com",
        },
        activeSubscription: 'fake-active-subscription',
        expires: "fake-expires"
      },
      status: "authenticated",
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')
  
    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalledWith('/posts')
  })
})
