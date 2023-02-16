function toHuman(dur) {
    let result = "";
    if (dur.values.years && Math.abs(dur.values.years) > 0)
    {
        result += Math.abs(dur.values.years) + "y"
        if (Math.abs(dur.values.years) < 10 && Math.abs(dur.values.days) > 0)
        {
            result += Math.abs(dur.values.days) + "d"
        }
        return result;
    }

    if (dur.values.days && Math.abs(dur.values.days) > 0)
    {
        result += Math.abs(dur.values.days) + "d"
        if (Math.abs(dur.values.days) < 10 && Math.abs(dur.values.minutes) > 0)
        {
            result += Math.abs(dur.values.minutes) + "m"
        }
        return result;
    }

    if (dur.values.minutes && Math.abs(dur.values.minutes) > 0)
    {
        result += Math.abs(dur.values.minutes) + "m"
        if (Math.abs(dur.values.minutes) < 10 && Math.abs(dur.values.seconds) > 0)
        {
            result += Math.abs(dur.values.seconds) + "s"
        }
        return result;
    }

    return result += Math.abs(dur.values.seconds) + "m"
}