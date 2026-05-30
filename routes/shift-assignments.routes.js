const express = require('express');
const shiftAssignmentController = require('../controllers/shift-assignment.controller');

function buildRouter(mode = 'auto') {
  const router = express.Router();
  const withMode = (handler) => shiftAssignmentController.withMode(mode, handler);

  router.get('/', withMode(shiftAssignmentController.listApi));
  router.get('/:id', withMode(shiftAssignmentController.detailApi));
  router.post('/', withMode(shiftAssignmentController.createApi));
  router.put('/:id', withMode(shiftAssignmentController.updateApi));
  router.delete('/:id', withMode(shiftAssignmentController.deleteApi));
  router.patch('/:id/status', withMode(shiftAssignmentController.updateStatusApi));

  return router;
}

const router = buildRouter('auto');

module.exports = router;
module.exports.buildRouter = buildRouter;
