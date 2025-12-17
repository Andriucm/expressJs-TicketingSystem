export default function paginate(model) {
	return async (req, res, next) => {
		const page = parseInt(req.query.page) || 1;
		const pageSize = parseInt(req.query.pageSize) || 10;
		const skip = (page - 1) * pageSize;
		const results = {};

		try {
			results.total = await model.countDocuments().exec();
			results.results = await model.find(req.filter).skip(skip).limit(pageSize).exec();
			results.pages = Math.ceil(results.total / pageSize);
			results.currentPage = page;
			results.count = results.results.length;

			req.paginatedResults = results;
			next();
		} catch (error) {
			res.status(500).send({ message: error.message, error: error });
		}
	};
}
