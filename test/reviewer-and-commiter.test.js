const { createRobot } = require('probot')
const plugin = require('..')

const payload = require('./events/review-submitted')

describe('Checking commit authors and reviewers', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn(),
        getContent: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            content: 'cmV2aWV3Y2hlY2tpbmc6IHllcw==\n'
          }
        }))
      },
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              user: {
                login: 'User1'
              },
              state: 'APPROVED'
            }
          ]
        })),
        getCommits: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              author: {
                login: 'User2'
              }
            },
            {
              author: {
                login: 'User1'
              }
            }
          ]
        }))
      }
    }

    robot.auth = () => Promise.resolve(github)
  })

  it('Should set the commit status to failure when a commiter approved changes', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'codereview/self-approve',
      'description': 'There is a commit author that approved changes',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'failure',
      'target_url': 'https://github.com/apps/self-approve'
    })
  })

  it('Should set the commit status to success when a commiter requested changes', async () => {
    github.pullRequests.getReviews = jest.fn().mockReturnValue(Promise.resolve({
      data: [
        {
          user: {
            login: 'User1'
          },
          state: 'CHANGES_REQUESTED'
        }
      ]
    }))

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'codereview/self-approve',
      'description': 'Reviews are ok',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/self-approve'
    })
  })

  it('Should set the commit status to success where there is no common reviewer and commiter', async () => {
    github.pullRequests.getReviews = jest.fn().mockReturnValue(Promise.resolve({
      data: [
        {
          user: {
            login: 'User3'
          },
          state: 'APPROVED'
        }
      ]
    }))

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'codereview/self-approve',
      'description': 'Reviews are ok',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/self-approve'
    })
  })

  it('Should set the commit status to success if no reviews', async () => {
    github.pullRequests.getReviews = jest.fn().mockReturnValue(Promise.resolve({
      data: []
    }))

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'codereview/self-approve',
      'description': 'Reviews are ok',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/self-approve'
    })
  })
})
