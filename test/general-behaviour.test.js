const { createRobot } = require('probot')
const plugin = require('..')

const payload = require('./events/review-submitted')

describe('Default behaviour', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn()
      },
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: []
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

  it('Should set the commit status to success if no reviews', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'wolfreview',
      'description': 'Reviews are ok',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/wolfreview'
    })
  })
})
