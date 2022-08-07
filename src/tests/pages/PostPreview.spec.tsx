import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe' 
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const post = {
  slug: 'my-new-post', 
  title: 'My New Post', 
  content: '<p>Post excerpt</p>', 
  updatedAt: 'March, 10'
}

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)

    useSessionMocked.mockReturnValueOnce({ data: null, status: 'unauthenticated' })

    render(<Post post={post} />)

    expect(screen.getByText('My New Post')).toBeInTheDocument()
    expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession)
    const useRouterMocked = jest.mocked(useRouter)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce({
      data: { 
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires'
      },
    } as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: 'heading', text: 'My New Post'
            }
          ],
          content: [
            {
              type: 'paragraph',
              text: 'Post content',
            },
          ],
        },
        last_publication_date: '08-06-2022',
      })
    } as any)

    const response = await getStaticProps({ params: { slug: 'my-new-post' } })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My New Post',
            content: '<p>Post content</p>',
            updatedAt: '06 de agosto de 2022'
          }
        }
      })
    )
  })
})