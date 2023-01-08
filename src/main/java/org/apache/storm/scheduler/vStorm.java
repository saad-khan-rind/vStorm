package org.apache.storm.scheduler;

import java.util.*;
import java.util.Map.Entry;

import com.google.common.base.Function;
import org.apache.storm.metric.StormMetricsRegistry;
import org.apache.storm.shade.com.google.common.annotations.VisibleForTesting;
import org.apache.storm.shade.com.google.common.collect.Sets;
import org.apache.storm.utils.ServerUtils;
import org.apache.storm.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class vStorm implements IScheduler {
    private static Set<WorkerSlot> badSlots(Map<WorkerSlot, List<ExecutorDetails>> existingSlots, int numExecutors, int numWorkers) {
        if (numWorkers != 0) {
            Map<Integer, Integer> distribution = Utils.integerDivided(numExecutors, numWorkers);
            Set<WorkerSlot> slots = new HashSet<>();

            for (Entry<WorkerSlot, List<ExecutorDetails>> entry : existingSlots.entrySet()) {
                Integer executorCount = entry.getValue().size();
                Integer workerCount = distribution.get(executorCount);
                if (workerCount != null && workerCount > 0) {
                    slots.add(entry.getKey());
                    workerCount--;
                    distribution.put(executorCount, workerCount);
                }
            }

            for (WorkerSlot slot : slots) {
                existingSlots.remove(slot);
            }

            return existingSlots.keySet();
        }

        return null;
    }

    public static Set<WorkerSlot> slotsCanReassign(Cluster cluster, Set<WorkerSlot> slots) {
        Set<WorkerSlot> result = new HashSet<>();
        for (WorkerSlot slot : slots) {
            if (!cluster.isBlackListed(slot.getNodeId())) {
                SupervisorDetails supervisor = cluster.getSupervisorById(slot.getNodeId());
                if (supervisor != null) {
                    Set<Integer> ports = supervisor.getAllPorts();
                    if (ports != null && ports.contains(slot.getPort())) {
                        result.add(slot);
                    }
                }
            }
        }
        return result;
    }

    public static void VStorm(Topologies topologies, Cluster cluster) {
        for (TopologyDetails topology : cluster.needsSchedulingTopologies()) {
            Set<ExecutorDetails> allExecutors = topology.getExecutors();

            Map<WorkerSlot, List<ExecutorDetails>> aliveAssigned = getAliveAssignedWorkerSlotExecutors(cluster, topology.getId());
            Set<ExecutorDetails> aliveExecutors = new HashSet<>();
            for (List<ExecutorDetails> list : aliveAssigned.values()) {
                aliveExecutors.addAll(list);
            }

            Set<WorkerSlot> canReassignSlots = slotsCanReassign(cluster, aliveAssigned.keySet());
            int totalSlotsToUse = Math.min(topology.getNumWorkers(), canReassignSlots.size() + cluster.getAvailableSlots().size());

            Set<WorkerSlot> badSlots = null;
            if (totalSlotsToUse > aliveAssigned.size() || !allExecutors.equals(aliveExecutors)) {
                badSlots = badSlots(aliveAssigned, allExecutors.size(), totalSlotsToUse);
            }
            if (badSlots != null) {
                cluster.freeSlots(badSlots);
            }
            scheduleTopologiesEvenly(new Topologies(topology), cluster);
        }
    }
    private static final Logger LOG = LoggerFactory.getLogger(EvenScheduler.class);

    @VisibleForTesting
    public static List<WorkerSlot> sortSlots(Cluster cluster) {
        List<WorkerSlot> availableSlots = cluster.getAvailableSlots();
        if(availableSlots!=null && availableSlots.size()>0) {
            List<WorkerSlot> sortedSlots = new ArrayList<>();
            List<Double> powers = new ArrayList<>();
            for (WorkerSlot slot : availableSlots) {
                SupervisorDetails supervisorDetails = cluster.getSupervisorById(slot.getNodeId());
                double power = ((0.8 * supervisorDetails.getTotalResources().getTotalCpu()) + ((1 - 0.8) * supervisorDetails.getTotalResources().getTotalMemoryMb()));
                powers.add(power);
                sortedSlots.add(slot);
            }
            for (int i = 0; i < sortedSlots.size(); i++) {
                for (int j = 1; j < sortedSlots.size(); j++) {
                    if (powers.get(j - 1) < powers.get(j)) {
                        Collections.swap(powers, j - 1, j);
                        Collections.swap(sortedSlots, j - 1, j);
                    }
                }
            }
            for (int i = 0; i < sortedSlots.size(); i++){
                System.out.println("slot id = "+sortedSlots.get(i).getId());
                System.out.println("power of slot = "+powers.get(i));
            }
            return sortedSlots;
        }
        return null;
    }

    public static Map<WorkerSlot, List<ExecutorDetails>> getAliveAssignedWorkerSlotExecutors(Cluster cluster, String topologyId) {
        SchedulerAssignment existingAssignment = cluster.getAssignmentById(topologyId);
        Map<ExecutorDetails, WorkerSlot> executorToSlot = null;
        if (existingAssignment != null) {
            executorToSlot = existingAssignment.getExecutorToSlot();
        }

        return Utils.reverseMap(executorToSlot);
    }
    private static Map<ExecutorDetails, WorkerSlot> scheduleTopology(TopologyDetails topology, Cluster cluster) {
        List<WorkerSlot> availableSlots = cluster.getAvailableSlots();
        Set<ExecutorDetails> allExecutors = topology.getExecutors();
        Map<WorkerSlot, List<ExecutorDetails>> aliveAssigned = getAliveAssignedWorkerSlotExecutors(cluster, topology.getId());
        int totalSlotsToUse = Math.min(topology.getNumWorkers(), availableSlots.size() + aliveAssigned.size());

        List<WorkerSlot> sortedList = sortSlots(cluster);
        if (sortedList == null) {
            LOG.error("No available slots for topology: {}", topology.getName());
            return new HashMap<>();
        }

        //allow requesting slots number bigger than available slots
        int toIndex = Math.min((totalSlotsToUse - aliveAssigned.size()), sortedList.size());
        List<WorkerSlot> reassignSlots = sortedList.subList(0, toIndex);

        Set<ExecutorDetails> aliveExecutors = new HashSet<>();
        for (List<ExecutorDetails> list : aliveAssigned.values()) {
            aliveExecutors.addAll(list);
        }
        Set<ExecutorDetails> reassignExecutors = Sets.difference(allExecutors, aliveExecutors);

        Map<ExecutorDetails, WorkerSlot> reassignment = new HashMap<>();
        if (reassignSlots.size() == 0) {
            return reassignment;
        }

        List<ExecutorDetails> executors = new ArrayList<>(reassignExecutors);
        executors.sort(Comparator.comparingInt(ExecutorDetails::getStartTask));
        int division = (int) Math.ceil(executors.size()/(double)reassignSlots.size());

        for (int i = 0,k=0; i < executors.size(); i++) {
            if(i % division == 0 && i!=0) {
                k++;
            }
            reassignment.put(executors.get(i), reassignSlots.get(k));

        }
//        for (int i = 0; i < executors.size(); i++) {
//            System.out.println("executor = " + i + " to slot = " + i % reassignSlots.size());
//            reassignment.put(executors.get(i), reassignSlots.get(i % reassignSlots.size()));
//        }
        if (reassignment.size() != 0) {
            LOG.info("Available slots: {}", availableSlots);
        }
        return reassignment;
    }

    public static void scheduleTopologiesEvenly(Topologies topologies, Cluster cluster) {
        for (TopologyDetails topology : cluster.needsSchedulingTopologies()) {
            String topologyId = topology.getId();
            Map<ExecutorDetails, WorkerSlot> newAssignment = scheduleTopology(topology, cluster);
            Map<WorkerSlot, List<ExecutorDetails>> nodePortToExecutors = Utils.reverseMap(newAssignment);

            for (Map.Entry<WorkerSlot, List<ExecutorDetails>> entry : nodePortToExecutors.entrySet()) {
                WorkerSlot nodePort = entry.getKey();
                List<ExecutorDetails> executors = entry.getValue();
                cluster.assign(nodePort, topologyId, executors);
            }
        }
    }


    @Override
    public void prepare(Map<String, Object> conf, StormMetricsRegistry metricsRegistry) {
        //noop
    }

    @Override
    public void schedule(Topologies topologies, Cluster cluster) {
        VStorm(topologies, cluster);
    }

    @Override
    public Map<String, Map<String, Double>> config() {
        return Collections.emptyMap();
    }


}
