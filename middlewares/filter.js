export default function buildFilter(req, res, next) {
	const { status, priority, assignedTo, createdBy, search } = req.query;
	const filter = {};
	if (status) filter.status = status;
	if (priority) filter.priority = priority;
	if (assignedTo) filter.assignedTo = assignedTo;
	if (createdBy) filter.createdBy = createdBy;
    if (search) filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }];
	req.filter = filter;
	next();
}
