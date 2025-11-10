import api from '../config/api';

export interface ActivityCategory {
  id: number;
  name: string;
}

export interface ActivityGroup {
  id: number;
  name: string;
  category_id: number;
}

export interface ActivityItem {
  id: number;
  name: string;
  group_id: number;
}

export const activitiesService = {
  async listCategories(): Promise<ActivityCategory[]> {
    const response = await api.get('/activities/categories');
    return response.data.categories;
  },

  async listGroups(categoryId: number): Promise<ActivityGroup[]> {
    const response = await api.get('/activities/groups', {
      params: { category_id: categoryId },
    });
    return response.data.groups;
  },

  async listItems(groupId: number): Promise<ActivityItem[]> {
    const response = await api.get('/activities/items', {
      params: { group_id: groupId },
    });
    return response.data.items;
  },
};
