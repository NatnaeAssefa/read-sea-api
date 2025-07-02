import { Transaction } from "sequelize";
import { RatingHelpfulness as BaseModel } from "../../models/MarketPlace";
import BaseDAL from "../Base.dal";

class RatingHelpfulnessDAL {
  static create = (payload: Partial<BaseModel>, t?: Transaction): Promise<BaseModel> => {
    return BaseDAL.create<BaseModel>(BaseModel, payload, t);
  };

  static findMany = (options: any, paranoid = false): Promise<{ rows: BaseModel[]; count: number }> => {
    return BaseDAL.findMany<BaseModel>(BaseModel, options, paranoid);
  };

  static findById = (id: string, options?: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findById<BaseModel>(BaseModel, id, options, paranoid);
  };

  static findOne = (options: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid);
  };

  static update = (obj: BaseModel, payload: any, t?: Transaction): Promise<BaseModel> => {
    return BaseDAL.update<BaseModel>(BaseModel, obj, payload, t);
  };

  static delete = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.delete<BaseModel>(BaseModel, query, t);
  };

  static restore = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.restore<BaseModel>(BaseModel, query, t);
  };

  static bulk_restore = (rule: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_restore<BaseModel>(BaseModel, rule, t);
  };

  // Custom method for finding user's helpfulness vote for a specific rating
  static findUserVoteForRating = (
    userId: string, 
    productRatingId: string, 
    paranoid = false
  ): Promise<BaseModel | null> => {
    const options = {
      where: {
        user_id: userId,
        product_rating_id: productRatingId
      }
    };

    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid);
  };

  // Custom method for getting helpfulness statistics for a rating
  static getRatingHelpfulnessStats = async (productRatingId: string, transaction?: Transaction): Promise<{
    helpfulCount: number;
    unhelpfulCount: number;
    totalVotes: number;
  }> => {
    const votes = await BaseModel.findAll({
      where: {
        product_rating_id: productRatingId
      },
      attributes: ['is_helpful'],
      transaction
    });

    const helpfulCount = votes.filter(vote => vote.is_helpful).length;
    const unhelpfulCount = votes.filter(vote => !vote.is_helpful).length;
    const totalVotes = votes.length;

    return {
      helpfulCount,
      unhelpfulCount,
      totalVotes
    };
  };

  // Custom method for toggling helpfulness vote (create, update, or delete)
  static toggleHelpfulnessVote = async (
    userId: string,
    productRatingId: string,
    isHelpful: boolean,
    t?: Transaction
  ): Promise<{ action: 'created' | 'updated' | 'deleted'; vote: BaseModel | null }> => {
    // Use transaction for finding existing vote to ensure consistency
    const existingVote = await BaseModel.findOne({
      where: {
        user_id: userId,
        product_rating_id: productRatingId
      },
      transaction: t
    });

    if (!existingVote) {
      // Create new vote
      const newVote = await this.create({
        user_id: userId,
        product_rating_id: productRatingId,
        is_helpful: isHelpful
      }, t);
      return { action: 'created', vote: newVote };
    }

    if (existingVote.is_helpful === isHelpful) {
      // Same vote - remove it (toggle off)
      await this.delete({ id: existingVote.id }, t);
      return { action: 'deleted', vote: null };
    } else {
      // Different vote - update it
      await this.update(existingVote, { is_helpful: isHelpful }, t);
      const updatedVote = await BaseModel.findByPk(existingVote.id, { transaction: t });
      return { action: 'updated', vote: updatedVote };
    }
  };
}

export default RatingHelpfulnessDAL;
