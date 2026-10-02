import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Solution {

    // Merge overlapping (and touching) intervals, sorted by start.
    public static List<int[]> merge(List<int[]> intervals) {
        List<int[]> sorted = new ArrayList<>(intervals);
        sorted.sort(Comparator.comparingInt(interval -> interval[0]));

        List<int[]> merged = new ArrayList<>();

        for (int[] interval : sorted) {
            if (merged.isEmpty()) {
                merged.add(new int[] {interval[0], interval[1]});
                continue;
            }

            int[] last = merged.get(merged.size() - 1);

            if (interval[0] <= last[1]) {
                last[1] = Math.max(last[1], interval[1]);
            } else {
                merged.add(new int[] {interval[0], interval[1]});
            }
        }

        return merged;
    }

    // Total length covered by the intervals once merged.
    public static int coveredLength(List<int[]> intervals) {
        int total = 0;

        for (int[] interval : merge(intervals)) {
            total += interval[1] - interval[0];
        }

        return total;
    }
}
