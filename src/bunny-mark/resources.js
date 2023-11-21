/**
 * @flow
 */

const get_resource_path = $SHBuiltin.extern_c({include: "resources.h"}, function _get_resource_path(path: c_ptr): c_ptr { throw 0; });
