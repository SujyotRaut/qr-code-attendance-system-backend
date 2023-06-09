import { query } from 'express-validator';

function pagination(defaultPageSize: number = 10) {
  return [
    query('_skip').customSanitizer((_, { req }) => {
      const _page = Math.abs(Number(req.query?._page || '0'));
      const _limit = Math.abs(Number(req.query?._limit || defaultPageSize.toString()));
      console.log(_page);
      console.log(_limit);
      const _skip = (_page - 1) * _limit;
      console.log(_skip);
      return _skip;
    }),
    query('_limit').customSanitizer((value) => Math.abs(Number(value)) || defaultPageSize),
  ];
}

export default pagination;
