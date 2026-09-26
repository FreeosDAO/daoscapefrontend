import store from 'app/src/store/index.js'

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "homeLayout" */ 'layouts/HomeLayout.vue'),
    children: [
      { path: '', component: () => import(/* webpackChunkName: "home" */ 'pages/home.vue') },
      { path: 'create', component: () => import(/* webpackChunkName: "create" */ 'pages/create.vue') },
      { path: 'browse', component: () => import(/* webpackChunkName: "browse" */ 'pages/browse.vue') },
      { path: 'create/:newgroupname', component: () => import(/* webpackChunkName: "create" */ 'pages/create.vue') },
      { path: 'tests', component: () => import(/* webpackChunkName: "test" */ 'pages/tests.vue') },
      { path: 'login', component: () => import(/* webpackChunkName: "login" */ 'pages/login.vue') },
      //{ path: 'pricing', component: () => import('pages/pricing.vue') }
    ]
  },

  {
    path: '/documentation',
    component: () => import(/* webpackChunkName: "docsLayout" */ 'layouts/DocsLayout.vue'),
    children: [
      { path: '', component: () => import(/* webpackChunkName: "gettingStarted" */ 'pages/docs/getting-started.vue') }
    ]
  },

  {
    path: '/manage', redirect: '/browse'
  },

  {
    path: '/manage/:groupname',
    component: () => import(/* webpackChunkName: "groupLayout" */ 'layouts/GroupLayout.vue'),
    children: [
      { path: '', component: () => import(/* webpackChunkName: "groupInfo" */ 'pages/manage/info.vue') },
      { path: 'sortition', component: () => import('pages/manage/governance.vue') },
      { path: 'member-governance', component: () => import('pages/manage/governance.vue') },
      { path: 'guardians', component: () => import(/* webpackChunkName: "groupGuardians" */ 'pages/manage/guardians.vue') },
      { path: 'proposals', component: () => import(/* webpackChunkName: "groupProposals" */ 'pages/manage/proposals.vue') },
      { path: 'new-proposal', component: () => import(/* webpackChunkName: "groupNewProposal" */ 'pages/manage/new-proposal.vue') },
      { path: 'settings', component: () => import(/* webpackChunkName: "groupSettings" */ 'pages/manage/settings.vue') },
      { path: 'treasury', component: () => import(/* webpackChunkName: "groupWallet" */ 'src/pages/manage/wallet.vue') },
      { path: 'resources', component: () => import(/* webpackChunkName: "groupResources" */ 'pages/manage/resources.vue') },
      { path: 'thresholds', component: () => import(/* webpackChunkName: "groupThresholds" */ 'pages/manage/thresholds.vue') },
      { path: 'modules', component: () => import(/* webpackChunkName: "groupModules" */ 'pages/manage/modules.vue') },
      { path: 'payroll', component: () => import(/* webpackChunkName: "groupPayroll" */ 'pages/manage/payroll.vue') },
      { path: 'members', component: () => import(/* webpackChunkName: "groupMembers" */ 'pages/manage/members.vue') },
      { path: 'files', component: () => import(/* webpackChunkName: "groupFiles" */ 'pages/manage/files.vue') },
      { path: 'hooks', component: () => import(/* webpackChunkName: "groupHooks" */ 'pages/manage/hooks.vue') },
      { path: 'nfts', component: () => import(/* webpackChunkName: "groupNFTs" */ 'pages/manage/nfts.vue') },
    ],
    beforeEnter: async (to, from) => {
      let session = await store().getters['proton/getSession']
      if(!session){
        return {path: '/login', query: {redirect: to.path}}
      }
    }
  },

  {
    path: '/members/:groupname',
    component: () => import(/* webpackChunkName: "groupLayout" */ 'layouts/GroupLayout.vue'),
    children: [
      { path: '', component: () => import(/* webpackChunkName: "groupInfo" */ 'pages/manage/info.vue') },
      { path: 'dashboard', component: () => import(/* webpackChunkName: "membersDashboard" */ 'pages/members/dashboard.vue') },
      { path: 'elections', component: () => import(/* webpackChunkName: "membersElections" */ 'pages/members/elections.vue') },
      { path: 'register', component: () => import(/* webpackChunkName: "membersRegister" */ 'pages/members/register.vue') },
      { path: 'my-tokens', component: () => import(/* webpackChunkName: "membersTokens" */ 'pages/members/my-tokens.vue') },
      { path: 'profile/:accountname', component: () => import(/* webpackChunkName: "membersProfile" */ 'pages/members/profile.vue') }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import(/* webpackChunkName: "error" */ 'pages/Error404.vue')
  }
]

export default routes
