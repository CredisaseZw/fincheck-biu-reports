import redis
from django.conf import settings
from pprintpp import pprint
r = redis.from_url(settings.REDIS_CACHE_LOCATION)


LOCK_TTL = 60 * 15

ACQUIRE_DUAL_LOCK_SCRIPT = """
local report_key = KEYS[1]
local subject_key = KEYS[2]
local user_id = ARGV[1]
local ttl = ARGV[2]

local report_holder = redis.call('GET', report_key)
local subject_holder = redis.call('GET', subject_key)

if report_holder and report_holder ~= user_id then
    return {0, 'report', report_holder}
end

if subject_holder and subject_holder ~= user_id then
    return {0, 'subject', subject_holder}
end

redis.call('SET', report_key, user_id, 'EX', ttl)
redis.call('SET', subject_key, user_id, 'EX', ttl)
return {1, 'ok', user_id}
"""

acquire_dual_lock = r.register_script(ACQUIRE_DUAL_LOCK_SCRIPT)
def acquire_report_lock(report_id, user_id, subject_id):
    report_key = f"report_lock:{report_id}"
    subject_key = f"subject_lock:{subject_id}"

    result = acquire_dual_lock(
        keys=[report_key, subject_key],
        args=[str(user_id), LOCK_TTL],
    )
    success, reason, holder = result[0], result[1].decode(), result[2].decode() if result[2] else None
    if not success:
        return False, {"locked_on": reason, "holder": holder}
    return True, {"holder": holder}


RELEASE_DUAL_LOCK_SCRIPT = """
local report_key = KEYS[1]
local subject_key = KEYS[2]
local user_id = ARGV[1]

local report_holder = redis.call('GET', report_key)
local subject_holder = redis.call('GET', subject_key)

if report_holder == user_id then
    redis.call('DEL', report_key)
end

if subject_holder == user_id then
    redis.call('DEL', subject_key)
end
return 1
"""

release_dual_lock = r.register_script(RELEASE_DUAL_LOCK_SCRIPT)
def release_report_lock(report_id, user_id, subject_id):
    release_dual_lock(
        keys=[f"report_lock:{report_id}", f"subject_lock:{subject_id}"],
        args=[str(user_id)],
    )

REFRESH_DUAL_LOCK_SCRIPT = """
local report_key = KEYS[1]
local subject_key = KEYS[2]
local user_id = ARGV[1]
local ttl = ARGV[2]

local report_holder = redis.call('GET', report_key)
local subject_holder = redis.call('GET', subject_key)

if report_holder ~= user_id then
    return 0
end

if subject_holder ~= user_id then
    return 0
end

redis.call('EXPIRE', report_key, ttl)
redis.call('EXPIRE', subject_key, ttl)
return 1
"""

refresh_dual_lock = r.register_script(REFRESH_DUAL_LOCK_SCRIPT)
def refresh_report_lock(report_id, user_id, subject_id):
    return bool(refresh_dual_lock(
        keys=[f"report_lock:{report_id}", f"subject_lock:{subject_id}"],
        args=[str(user_id), LOCK_TTL],
    ))